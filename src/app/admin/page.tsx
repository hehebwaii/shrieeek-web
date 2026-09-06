"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldAlert,
  Users,
  QrCode,
  Lock,
  Unlock,
  Download,
  Upload,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  KeyRound,
  FileSpreadsheet,
  LogOut,
  Zap,
  Activity,
  Award,
  Sparkles,
  ArrowRight,
  Megaphone,
  Send,
  Trash2,
  AlertTriangle,
  Bell,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { useEventSync } from "@/hooks/useEventSync";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Admin Data State
  const [config, setConfig] = useState<any | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [batchText, setBatchText] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [resetSuccessId, setResetSuccessId] = useState<string | null>(null);

  // Announcement State
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [announcementSeverity, setAnnouncementSeverity] = useState<"event" | "urgent" | "info">("event");
  const [broadcastStatus, setBroadcastStatus] = useState<string | null>(null);

  const fetchAdminData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin");
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setConfig(data.config);
        setStats(data.stats);
        setRoster(data.roster || []);
      } else {
        if (!silent) setIsAuthenticated(false);
      }
    } catch {
      if (!silent) setIsAuthenticated(false);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Live real-time sync for admin operations
  const { isConnected } = useEventSync({
    onScanAwarded: () => {
      if (isAuthenticated) fetchAdminData(true);
    },
    onParticipantReset: () => {
      if (isAuthenticated) fetchAdminData(true);
    },
    onRosterUpdated: () => {
      if (isAuthenticated) fetchAdminData(true);
    },
    onConfigChange: (newConfig) => {
      setConfig(newConfig);
    },
  });

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
        fetchAdminData();
      } else {
        setLoginError(data.error || "Invalid passphrase.");
      }
    } catch {
      setLoginError("Login connection failed.");
    }
  };

  const handleAdminLogout = async () => {
    try {
      await fetch("/api/auth/admin-logout", { method: "POST" });
      setIsAuthenticated(false);
      setAdminPassword("");
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleToggleEvent = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_event" }),
      });
      const data = await res.json();
      if (res.ok) {
        setConfig(data.config);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleLeaderboard = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_leaderboard" }),
      });
      const data = await res.json();
      if (res.ok) {
        setConfig(data.config);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleBroadcastAnnouncement = async () => {
    if (!announcementMsg.trim()) return;
    setActionLoading(true);
    setBroadcastStatus(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "broadcast_announcement",
          message: announcementMsg.trim(),
          severity: announcementSeverity,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBroadcastStatus("Broadcast sent live to all student devices!");
        setConfig(data.config);
        setAnnouncementMsg("");
        setTimeout(() => setBroadcastStatus(null), 4000);
      } else {
        setBroadcastStatus(data.error || "Broadcast failed.");
      }
    } catch {
      setBroadcastStatus("Network error broadcasting announcement.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearAnnouncement = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_announcement" }),
      });
      const data = await res.json();
      if (res.ok) {
        setConfig(data.config);
        setBroadcastStatus("Active announcement cleared globally.");
        setTimeout(() => setBroadcastStatus(null), 3000);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleBatchImport = async () => {
    if (!batchText.trim()) return;
    setActionLoading(true);
    setImportStatus(null);
    try {
      const lines = batchText.split("\n");
      const items = lines
        .map((line) => {
          const parts = line.split(/[,;\t]/);
          const phone = parts[0]?.trim();
          const name = parts[1]?.trim();
          return phone ? { phone, name } : null;
        })
        .filter(Boolean);

      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import_batch", items }),
      });

      const data = await res.json();
      if (res.ok) {
        setImportStatus(`Successfully registered ${data.added} participants (${data.skipped} duplicates skipped).`);
        setBatchText("");
        fetchAdminData();
      } else {
        setImportStatus(data.error || "Import failed.");
      }
    } catch {
      setImportStatus("Import network error.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetParticipant = async (participantId: string, name: string) => {
    if (!confirm(`Are you sure you want to reset XP, Level and Character for ${name}?`)) return;
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_participant", participantId }),
      });
      if (res.ok) {
        setResetSuccessId(participantId);
        setTimeout(() => setResetSuccessId(null), 3000);
        fetchAdminData();
      }
    } catch {
      alert("Failed to reset participant.");
    }
  };

  const handleExportCSV = () => {
    if (roster.length === 0) return;
    const headers = "Rank,Phone Number,Display Name,Hero Title,Level,Total XP,Manual Code,QR Token,Last Scan Time\n";
    const rows = roster
      .map(
        (p, idx) =>
          `${idx + 1},"${p.phone_number}","${p.display_name}","${p.heroTitle}",${p.level},${p.xp},"${p.manual_code}","${p.qr_token}","${p.last_scan_at || "Never"}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `IEEE_ShrIEEEk26_Leaderboard_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PASSWORD GATE (When not authenticated)
  if (!isAuthenticated && !loading) {
    return (
      <div className="flex-1 w-full min-h-screen flex items-center justify-center p-4 bg-[#0e0e0e] bg-halftone">
        <div className="w-full max-w-md bg-[#181818] border-3 border-brand-yellow p-8 rounded-3xl shadow-[0_0_50px_rgba(243,240,0,0.15)] relative">
          <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-brand-yellow/15 border-2 border-brand-yellow flex items-center justify-center shadow-[0_0_25px_#F3F000]">
            <Lock className="w-10 h-10 text-brand-yellow" />
          </div>

          <div className="text-center mb-6">
            <div className="inline-block px-3 py-0.5 bg-brand-red text-white text-[11px] font-black uppercase tracking-widest comic-tag mb-2">
              <span className="comic-tag-inner">RESTRICTED ACCESS</span>
            </div>
            <h1 className="font-comic text-4xl text-brand-yellow uppercase tracking-wide">
              ADMIN CONSOLE
            </h1>
            <p className="text-xs text-brand-muted mt-1.5 leading-relaxed">
              IEEE Event Organizer Operations &amp; Combat Control System
            </p>
          </div>

          {loginError && (
            <div className="mb-5 p-3.5 bg-red-950/80 border border-brand-red text-red-200 text-xs rounded-xl flex items-center gap-2.5 animate-comic-pop">
              <AlertCircle className="w-4 h-4 text-brand-red flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-brand-yellow" /> Security Passphrase
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter admin passphrase"
                required
                className="w-full px-4 py-3.5 bg-[#121212] border-2 border-[#333333] focus:border-brand-yellow focus:outline-none rounded-xl text-sm font-mono text-white placeholder:text-[#555555] transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-brand-yellow hover:bg-[#ffe600] active:scale-95 text-black font-comic text-2xl uppercase tracking-wider rounded-xl shadow-comic-black border-2 border-black transition-all flex items-center justify-center gap-2"
            >
              UNLOCK OPERATIONS <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredRoster = roster.filter(
    (p) =>
      p.phone_number.includes(search) ||
      p.display_name.toLowerCase().includes(search.toLowerCase()) ||
      p.heroTitle.toLowerCase().includes(search.toLowerCase()) ||
      p.manual_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 bg-[#121212] bg-halftone">
      {/* Top Header Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-[#2C2C2C]">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 bg-brand-red text-white text-[10px] font-black uppercase tracking-widest comic-tag">
              <span className="comic-tag-inner">IEEE ORGANIZER OPERATIONS</span>
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-green-400 bg-green-950/40 px-2.5 py-0.5 rounded-full border border-green-500/30">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              SYSTEM ACTIVE
            </span>
          </div>
          <h1 className="font-comic text-4xl sm:text-5xl text-brand-yellow uppercase tracking-wide drop-shadow-[2px_2px_0px_#000000]">
            ShrIEEEk &apos;26 CONTROL PANEL
          </h1>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => fetchAdminData()}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-[#1C1C1C] hover:bg-[#252525] active:scale-95 border border-[#3A3A3A] hover:border-brand-yellow rounded-xl text-xs font-mono text-brand-yellow font-bold transition-all shadow-sm"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-[#1C1C1C] hover:bg-[#252525] active:scale-95 border border-[#3A3A3A] hover:border-green-400 rounded-xl text-xs font-mono text-green-400 font-bold transition-all shadow-sm"
            title="Download CSV Leaderboard Report"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleAdminLogout}
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 bg-red-950/70 hover:bg-brand-red active:scale-95 text-xs font-mono text-white font-bold rounded-xl border border-brand-red/60 transition-all shadow-sm"
            title="Lock and sign out of admin console"
          >
            <LogOut className="w-4 h-4" />
            <span>Lock Admin</span>
          </button>
        </div>
      </header>

      {/* KPI Stats Overview Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Metric 1: Total Participants */}
        <div className="bg-[#181818] border-2 border-[#2C2C2C] hover:border-brand-yellow/60 p-4 rounded-2xl transition-all shadow-md">
          <div className="flex items-center justify-between text-brand-muted text-xs font-bold uppercase tracking-wider mb-2">
            <span>Participants</span>
            <div className="p-1.5 bg-brand-yellow/10 rounded-lg text-brand-yellow">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-3xl sm:text-4xl text-white">
            {stats?.totalParticipants || 0}
          </div>
          <div className="text-[11px] text-brand-muted mt-1 font-mono">
            Pre-registered roster count
          </div>
        </div>

        {/* Metric 2: Total Scans */}
        <div className="bg-[#181818] border-2 border-[#2C2C2C] hover:border-green-500/60 p-4 rounded-2xl transition-all shadow-md">
          <div className="flex items-center justify-between text-brand-muted text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Scans</span>
            <div className="p-1.5 bg-green-500/10 rounded-lg text-green-400">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-3xl sm:text-4xl text-green-400">
            {stats?.totalScans || 0}
          </div>
          <div className="text-[11px] text-brand-muted mt-1 font-mono">
            {((stats?.totalScans || 0) * 10)} XP awarded in total
          </div>
        </div>

        {/* Metric 3: Active Scanners */}
        <div className="bg-[#181818] border-2 border-[#2C2C2C] hover:border-cyan-400/60 p-4 rounded-2xl transition-all shadow-md">
          <div className="flex items-center justify-between text-brand-muted text-xs font-bold uppercase tracking-wider mb-2">
            <span>Active Scanners</span>
            <div className="p-1.5 bg-cyan-400/10 rounded-lg text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-3xl sm:text-4xl text-cyan-400">
            {stats?.activeScanners || 0}
          </div>
          <div className="text-[11px] text-brand-muted mt-1 font-mono">
            Unique players scanning
          </div>
        </div>

        {/* Metric 4: Event Scan Status */}
        <div className="bg-[#181818] border-2 border-[#2C2C2C] hover:border-brand-red/60 p-4 rounded-2xl transition-all shadow-md">
          <div className="flex items-center justify-between text-brand-muted text-xs font-bold uppercase tracking-wider mb-2">
            <span>Scanning Engine</span>
            <div className="p-1.5 bg-brand-red/10 rounded-lg text-brand-red">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`font-mono font-black text-2xl sm:text-3xl uppercase ${
              config?.is_event_active ? "text-green-400" : "text-brand-red"
            }`}
          >
            {config?.is_event_active ? "LIVE" : "PAUSED"}
          </div>
          <div className="text-[11px] text-brand-muted mt-1 font-mono">
            {config?.is_event_active ? "Accepting scans" : "Scans blocked"}
          </div>
        </div>
      </section>

      {/* Main Operational Controls (2 Interactive Switches) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Toggle 1: Scanning Engine Switch */}
        <div className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
          config?.is_event_active
            ? "bg-[#142319] border-green-500/70 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
            : "bg-[#251314] border-brand-red/70 shadow-[0_0_20px_rgba(230,36,41,0.15)]"
        }`}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="text-[10px] font-mono uppercase font-black tracking-widest text-brand-muted mb-1">
                EVENT SCANNING WINDOW
              </div>
              <h3 className="font-comic text-2xl text-white uppercase">
                {config?.is_event_active ? "SCANNING ENGINE IS ACTIVE" : "SCANNING ENGINE IS PAUSED"}
              </h3>
              <p className="text-xs text-brand-muted mt-1 leading-relaxed max-w-md">
                {config?.is_event_active
                  ? "Participants can scan QR codes and earn XP. Click Pause to freeze scoring during event announcements or breaks."
                  : "All in-app scanning is currently frozen. Participants attempting to scan will receive an event paused message."}
              </p>
            </div>
            <div className={`p-3 rounded-xl border ${
              config?.is_event_active ? "bg-green-500/20 border-green-500 text-green-400" : "bg-red-500/20 border-red-500 text-brand-red"
            }`}>
              {config?.is_event_active ? <Play className="w-6 h-6 fill-green-400" /> : <Pause className="w-6 h-6 fill-brand-red" />}
            </div>
          </div>

          <button
            onClick={handleToggleEvent}
            disabled={actionLoading}
            type="button"
            className={`w-full py-3.5 font-comic text-xl uppercase tracking-wider rounded-xl shadow-comic-black border-2 border-black transition-all active:scale-98 flex items-center justify-center gap-2 ${
              config?.is_event_active
                ? "bg-brand-red hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-400 text-black"
            }`}
          >
            {config?.is_event_active ? (
              <>
                <Pause className="w-5 h-5 fill-white" /> PAUSE ALL SCANNING
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-black" /> START / RESUME SCANNING
              </>
            )}
          </button>
        </div>

        {/* Toggle 2: Participant Leaderboard Visibility Switch */}
        <div className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
          config?.is_leaderboard_public
            ? "bg-[#24210a] border-brand-yellow/80 shadow-[0_0_20px_rgba(243,240,0,0.15)]"
            : "bg-[#181818] border-[#333333]"
        }`}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="text-[10px] font-mono uppercase font-black tracking-widest text-brand-muted mb-1">
                STUDENT MOBILE VISIBILITY
              </div>
              <h3 className="font-comic text-2xl text-white uppercase">
                {config?.is_leaderboard_public ? "LEADERBOARD IS PUBLIC" : "LEADERBOARD IS PRIVATE"}
              </h3>
              <p className="text-xs text-brand-muted mt-1 leading-relaxed max-w-md">
                {config?.is_leaderboard_public
                  ? "Students can see the full live leaderboard ranking on their mobile devices."
                  : "Rankings are hidden from participants. Students only see their own level/XP while organizers track live progress privately."}
              </p>
            </div>
            <div className={`p-3 rounded-xl border ${
              config?.is_leaderboard_public ? "bg-brand-yellow/20 border-brand-yellow text-brand-yellow" : "bg-[#252525] border-[#3A3A3A] text-brand-muted"
            }`}>
              {config?.is_leaderboard_public ? <Eye className="w-6 h-6 text-brand-yellow" /> : <EyeOff className="w-6 h-6" />}
            </div>
          </div>

          <button
            onClick={handleToggleLeaderboard}
            disabled={actionLoading}
            type="button"
            className={`w-full py-3.5 font-comic text-xl uppercase tracking-wider rounded-xl shadow-comic-black border-2 border-black transition-all active:scale-98 flex items-center justify-center gap-2 ${
              config?.is_leaderboard_public
                ? "bg-[#2A2A2A] hover:bg-[#333333] text-brand-yellow border-brand-yellow"
                : "bg-brand-yellow hover:bg-[#ffe600] text-black"
            }`}
          >
            {config?.is_leaderboard_public ? (
              <>
                <EyeOff className="w-5 h-5" /> HIDE FROM PARTICIPANTS (MAKE PRIVATE)
              </>
            ) : (
              <>
                <Eye className="w-5 h-5" /> REVEAL TO PARTICIPANTS (MAKE PUBLIC)
              </>
            )}
          </button>
        </div>
      </section>

      {/* Live Global Broadcast Announcement Control Card */}
      <section className="bg-[#181818] border-2 border-[#2C2C2C] p-5 sm:p-6 rounded-2xl mb-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-yellow/10 rounded-lg text-brand-yellow">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-comic text-2xl text-white uppercase tracking-wide flex items-center gap-2">
                LIVE GLOBAL ANNOUNCEMENT BROADCAST
              </h2>
              <p className="text-xs text-brand-muted">
                Push instant comic alert tickers directly to all participant mobile screens in real time
              </p>
            </div>
          </div>

          {/* Quick templates */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setAnnouncementMsg("⚡ Round 2 is officially live! Double XP active for 15 minutes!");
                setAnnouncementSeverity("event");
              }}
              className="text-[11px] font-mono px-2.5 py-1 bg-[#222222] hover:bg-brand-yellow hover:text-black rounded-lg transition-all text-brand-muted"
            >
              + Round 2 Template
            </button>
            <button
              type="button"
              onClick={() => {
                setAnnouncementMsg("🚨 5 MINUTES REMAINING in this combat round! Lock in your final scans!");
                setAnnouncementSeverity("urgent");
              }}
              className="text-[11px] font-mono px-2.5 py-1 bg-[#222222] hover:bg-brand-red hover:text-white rounded-lg transition-all text-brand-muted"
            >
              + 5 Min Alert
            </button>
            <button
              type="button"
              onClick={() => {
                setAnnouncementMsg("🍕 Event Break: Scanning is temporarily paused. Snacks at main counter!");
                setAnnouncementSeverity("info");
              }}
              className="text-[11px] font-mono px-2.5 py-1 bg-[#222222] hover:bg-cyan-400 hover:text-black rounded-lg transition-all text-brand-muted"
            >
              + Break Template
            </button>
          </div>
        </div>

        {/* Active Announcement Preview Status */}
        {config?.active_announcement && (
          <div className="mb-4 p-3.5 bg-[#1C1A00] border-2 border-brand-yellow rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-comic-pop">
            <div className="flex items-start gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow animate-ping mt-1 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-yellow">
                    ACTIVE ON ALL PARTICIPANT SCREENS ({config.active_announcement.severity.toUpperCase()})
                  </span>
                  <span className="text-[10px] font-mono text-brand-muted">
                    {new Date(config.active_announcement.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs font-comic text-white mt-0.5">
                  &ldquo;{config.active_announcement.message}&rdquo;
                </p>
              </div>
            </div>

            <button
              onClick={handleClearAnnouncement}
              disabled={actionLoading}
              type="button"
              className="px-3 py-1.5 bg-red-950 hover:bg-brand-red text-red-200 hover:text-white border border-brand-red/60 text-xs font-mono font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all self-end sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Broadcast</span>
            </button>
          </div>
        )}

        <div className="space-y-3">
          <textarea
            value={announcementMsg}
            onChange={(e) => setAnnouncementMsg(e.target.value)}
            placeholder="Type live announcement message to broadcast to all phones..."
            rows={2}
            className="w-full p-3.5 bg-[#121212] border-2 border-[#333333] focus:border-brand-yellow focus:outline-none rounded-xl text-xs font-mono text-white placeholder:text-[#555555] transition-colors"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-brand-muted uppercase">Urgency:</span>
              <button
                type="button"
                onClick={() => setAnnouncementSeverity("event")}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border transition-all ${
                  announcementSeverity === "event"
                    ? "bg-brand-yellow text-black border-brand-yellow shadow-comic-sm"
                    : "bg-[#202020] text-brand-muted border-[#333333]"
                }`}
              >
                Event Gold
              </button>
              <button
                type="button"
                onClick={() => setAnnouncementSeverity("urgent")}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border transition-all ${
                  announcementSeverity === "urgent"
                    ? "bg-brand-red text-white border-brand-red shadow-comic-sm"
                    : "bg-[#202020] text-brand-muted border-[#333333]"
                }`}
              >
                Urgent Red
              </button>
              <button
                type="button"
                onClick={() => setAnnouncementSeverity("info")}
                className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border transition-all ${
                  announcementSeverity === "info"
                    ? "bg-cyan-400 text-black border-cyan-400 shadow-comic-sm"
                    : "bg-[#202020] text-brand-muted border-[#333333]"
                }`}
              >
                Info Cyan
              </button>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {broadcastStatus && (
                <span className="text-xs font-mono font-bold text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {broadcastStatus}
                </span>
              )}
              <button
                onClick={handleBroadcastAnnouncement}
                disabled={actionLoading || !announcementMsg.trim()}
                type="button"
                className="px-6 py-2.5 bg-brand-yellow hover:bg-[#ffe600] active:scale-95 text-black font-comic text-base uppercase tracking-wider rounded-xl shadow-comic-black border-2 border-black transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{actionLoading ? "SENDING..." : "BROADCAST LIVE"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Batch Roster Import Panel */}
      <section className="bg-[#181818] border-2 border-[#2C2C2C] p-5 sm:p-6 rounded-2xl mb-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-yellow/10 rounded-lg text-brand-yellow">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-comic text-2xl text-white uppercase tracking-wide">
                BATCH PARTICIPANT ROSTER IMPORT
              </h2>
              <p className="text-xs text-brand-muted">
                Pre-register participant phone numbers and names for instant login access
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setBatchText("9876500001, Natasha Romanoff\n9876500002, Clint Barton\n9876500003, Wanda Maximoff\n9876500004, Steve Rogers")
            }
            className="text-xs text-brand-yellow hover:underline font-mono self-start sm:self-auto"
          >
            + Load Sample Format
          </button>
        </div>

        <textarea
          value={batchText}
          onChange={(e) => setBatchText(e.target.value)}
          placeholder="Paste phone numbers and names (one per line):&#10;9876543210, John Doe&#10;9123456780, Jane Smith"
          rows={3}
          className="w-full p-3.5 bg-[#121212] border-2 border-[#333333] focus:border-brand-yellow focus:outline-none rounded-xl text-xs font-mono text-white mb-3 placeholder:text-[#555555] transition-colors"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            {importStatus && (
              <span className={`text-xs font-mono font-bold flex items-center gap-1.5 ${
                importStatus.includes("Successfully") ? "text-green-400" : "text-brand-red"
              }`}>
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {importStatus}
              </span>
            )}
          </div>
          <button
            onClick={handleBatchImport}
            disabled={actionLoading || !batchText.trim()}
            type="button"
            className="px-6 py-3 bg-brand-yellow hover:bg-[#ffe600] active:scale-95 text-black font-comic text-lg uppercase tracking-wider rounded-xl shadow-comic-black border-2 border-black transition-all disabled:opacity-50 self-end sm:self-auto"
          >
            {actionLoading ? "IMPORTING..." : "REGISTER PARTICIPANTS"}
          </button>
        </div>
      </section>

      {/* Full Participant Roster & Live Scores Table */}
      <section className="bg-[#181818] border-2 border-[#2C2C2C] p-5 sm:p-6 rounded-2xl shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-comic text-2xl sm:text-3xl text-white uppercase tracking-wide flex items-center gap-2">
              <Award className="w-6 h-6 text-brand-yellow" />
              PARTICIPANT ROSTER &amp; SCORES ({filteredRoster.length})
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Live sorted by XP descending. Displays verified scan activity and tokens.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search phone, name, hero, code..."
              className="w-full pl-9 pr-4 py-2.5 bg-[#121212] border-2 border-[#333333] focus:border-brand-yellow rounded-xl text-xs font-mono text-white placeholder:text-[#555555] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto rounded-xl border border-[#2C2C2C]">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-[#141414] border-b border-[#2C2C2C] text-brand-muted text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3">Display Name</th>
                <th className="py-3 px-3">Assigned Hero</th>
                <th className="py-3 px-3">Manual Code</th>
                <th className="py-3 px-3">Level</th>
                <th className="py-3 px-3">Total XP</th>
                <th className="py-3 px-3">Last Scan</th>
                <th className="py-3 px-3 text-right">Reset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222] bg-[#181818]">
              {filteredRoster.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-brand-muted font-sans text-sm">
                    No participants matched your search.
                  </td>
                </tr>
              ) : (
                filteredRoster.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-[#202020] transition-colors">
                    <td className="py-3 px-3 text-brand-muted font-bold">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-3 font-bold text-white tracking-wider">
                      {p.phone_number}
                    </td>
                    <td className="py-3 px-3 font-sans font-bold text-brand-yellow">
                      {p.display_name}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded text-[11px] font-comic tracking-wide uppercase ${
                        p.heroTitle === "UNASSIGNED"
                          ? "bg-[#252525] text-brand-muted"
                          : "bg-black text-white border border-brand-border"
                      }`}>
                        {p.heroTitle}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                        {p.manual_code}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-white px-2 py-0.5 bg-[#252525] rounded">
                        LVL {p.level}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-brand-yellow text-sm">
                        {p.xp} XP
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#888888] text-[11px]">
                      {p.last_scan_at ? new Date(p.last_scan_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Never"}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleResetParticipant(p.id, p.display_name)}
                        type="button"
                        className="p-1.5 hover:bg-brand-red/20 text-brand-muted hover:text-brand-red rounded-lg transition-all"
                        title={`Reset stats for ${p.display_name}`}
                      >
                        <RotateCcw className={`w-4 h-4 ${resetSuccessId === p.id ? "text-green-400" : ""}`} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
