"use client";

import React, { useEffect, useState } from "react";
import {
  Trophy,
  Medal,
  Lock,
  RefreshCw,
  Zap,
  Sparkles,
  Shield,
  Search,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";

import { useEventSync } from "@/hooks/useEventSync";

interface LeaderboardEntry {
  rank: number;
  id: string;
  displayName: string;
  heroTitle: string;
  heroId: string;
  heroAccent: string;
  level: number;
  xp: number;
  tierName: string;
  tierBadge: string;
  isCurrent: boolean;
}

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(true);
  const [privateMessage, setPrivateMessage] = useState("");
  const [myStats, setMyStats] = useState<any | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [search, setSearch] = useState("");

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/leaderboard?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (res.ok) {
        setIsPublic(Boolean(data.isPublic));
        if (data.isPublic) {
          setEntries(data.leaderboard || []);
        } else {
          setPrivateMessage(data.message || "The leaderboard is currently hidden by event organizers.");
          setMyStats(data.myStats);
        }
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Real-time synchronization with Admin and live combat scans
  const { isConnected } = useEventSync({
    onConfigChange: (config) => {
      if (config && typeof config.is_leaderboard_public === "boolean") {
        setIsPublic(config.is_leaderboard_public);
      }
      fetchLeaderboard();
    },
    onScanAwarded: () => {
      fetchLeaderboard();
    },
    onParticipantReset: () => {
      fetchLeaderboard();
    },
    onRosterUpdated: () => {
      fetchLeaderboard();
    },
  });

  const filteredEntries = entries.filter(
    (e) =>
      e.displayName.toLowerCase().includes(search.toLowerCase()) ||
      e.heroTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-md md:max-w-lg mx-auto border-x border-[#2C2C2C] shadow-2xl min-h-screen flex flex-col p-4 bg-[#121212] bg-halftone pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-brand-yellow" />
          <h1 className="font-comic text-2xl text-brand-yellow uppercase tracking-wide">
            EVENT LEADERBOARD
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {isConnected && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-green-400 bg-green-950/40 px-2 py-0.5 rounded-full border border-green-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              LIVE
            </span>
          )}
          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            type="button"
            className="p-1.5 bg-[#1C1C1C] hover:bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-brand-muted hover:text-white transition-all active:scale-95"
            title="Refresh rankings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-yellow" : ""}`} />
          </button>
        </div>
      </div>

      {loading && entries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-12 h-12 rounded-full border-3 border-brand-yellow border-t-transparent animate-spin mb-3" />
          <span className="font-comic text-lg text-brand-muted uppercase">
            CALCULATING COMBAT RANKINGS...
          </span>
        </div>
      ) : !isPublic ? (
        /* PRIVATE LEADERBOARD STATE */
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[#181818] border-2 border-[#2C2C2C] rounded-2xl shadow-xl my-4">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-yellow/15 border-2 border-brand-yellow flex items-center justify-center">
            <Lock className="w-10 h-10 text-brand-yellow" />
          </div>
          <div className="px-3 py-0.5 bg-brand-red text-white text-[11px] font-black uppercase tracking-widest comic-tag mb-2">
            <span className="comic-tag-inner">ORGANIZER ENCRYPTED</span>
          </div>
          <h2 className="font-comic text-3xl text-white uppercase mb-2">
            RANKINGS HIDDEN
          </h2>
          <p className="text-xs text-brand-muted max-w-xs mb-6 leading-relaxed">
            {privateMessage || "The live leaderboard is currently private to organizers."}
          </p>

          {myStats && (
            <div className="w-full max-w-xs bg-[#121212] border border-brand-yellow/40 p-4 rounded-xl shadow-comic-sm">
              <div className="text-[10px] uppercase font-bold tracking-widest text-brand-muted mb-1">
                Your Personal Combat Record
              </div>
              <div className="text-base font-bold text-white mb-2">
                {myStats.displayName}
              </div>
              <div className="flex justify-around text-xs font-mono pt-2 border-t border-[#222222]">
                <div>
                  <span className="text-brand-muted block text-[10px]">TOTAL XP</span>
                  <span className="text-brand-yellow font-bold text-sm">
                    {myStats.xp} XP
                  </span>
                </div>
                <div className="border-r border-[#2C2C2C]" />
                <div>
                  <span className="text-brand-muted block text-[10px]">LEVEL</span>
                  <span className="text-white font-bold text-sm">
                    LVL {myStats.level}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* PUBLIC LEADERBOARD VIEW */
        <div className="flex-1 flex flex-col">
          {/* Search bar */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search player or hero codename..."
              className="w-full pl-9 pr-4 py-2 bg-[#181818] border border-[#2C2C2C] focus:border-brand-yellow focus:outline-none rounded-xl text-xs text-white placeholder:text-[#555555]"
            />
          </div>

          {/* Top 3 Podium Highlights if available */}
          {filteredEntries.length >= 3 && !search && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {/* 2nd Place */}
              <div className="bg-[#181818] border-2 border-slate-400 p-2.5 rounded-xl text-center flex flex-col items-center relative shadow-sm mt-3">
                <div className="absolute -top-3 w-6 h-6 rounded-full bg-slate-300 text-black font-black text-xs flex items-center justify-center shadow">
                  2
                </div>
                <div className="text-[10px] font-mono text-slate-300 font-bold mt-2 truncate w-full">
                  {filteredEntries[1].displayName}
                </div>
                <div className="text-xs font-comic text-white truncate w-full">
                  {filteredEntries[1].heroTitle}
                </div>
                <div className="text-[11px] font-mono text-brand-yellow font-bold mt-1">
                  {filteredEntries[1].xp} XP
                </div>
              </div>

              {/* 1st Place (Gold Champion) */}
              <div className="bg-[#1A1800] border-2 border-brand-yellow p-2.5 rounded-xl text-center flex flex-col items-center relative shadow-comic-yellow scale-105 z-10">
                <div className="absolute -top-3.5 w-7 h-7 rounded-full bg-brand-yellow text-black font-black text-sm flex items-center justify-center border border-black shadow">
                  <Medal className="w-4 h-4 fill-black" />
                </div>
                <div className="text-[11px] font-mono text-brand-yellow font-black mt-2.5 truncate w-full">
                  {filteredEntries[0].displayName}
                </div>
                <div className="text-xs font-comic text-white truncate w-full">
                  {filteredEntries[0].heroTitle}
                </div>
                <div className="text-xs font-mono text-brand-yellow font-black mt-1">
                  {filteredEntries[0].xp} XP
                </div>
              </div>

              {/* 3rd Place */}
              <div className="bg-[#181818] border-2 border-amber-700 p-2.5 rounded-xl text-center flex flex-col items-center relative shadow-sm mt-4">
                <div className="absolute -top-3 w-6 h-6 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center shadow">
                  3
                </div>
                <div className="text-[10px] font-mono text-amber-400 font-bold mt-2 truncate w-full">
                  {filteredEntries[2].displayName}
                </div>
                <div className="text-xs font-comic text-white truncate w-full">
                  {filteredEntries[2].heroTitle}
                </div>
                <div className="text-[11px] font-mono text-brand-yellow font-bold mt-1">
                  {filteredEntries[2].xp} XP
                </div>
              </div>
            </div>
          )}

          {/* Ranked List */}
          <div className="space-y-2">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  entry.isCurrent
                    ? "bg-[#221f00] border-brand-yellow shadow-comic-sm"
                    : "bg-[#181818] border-[#282828] hover:border-[#3A3A3A]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg font-comic text-base flex items-center justify-center font-bold ${
                      entry.rank === 1
                        ? "bg-brand-yellow text-black"
                        : entry.rank === 2
                        ? "bg-slate-300 text-black"
                        : entry.rank === 3
                        ? "bg-amber-600 text-white"
                        : "bg-[#252525] text-brand-muted"
                    }`}
                  >
                    #{entry.rank}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white">
                        {entry.displayName}
                      </span>
                      {entry.isCurrent && (
                        <span className="px-1.5 py-0.2 bg-brand-yellow text-black text-[9px] font-bold rounded">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-comic text-brand-yellow tracking-wide flex items-center gap-1">
                      <Zap className="w-3 h-3 text-brand-yellow" />
                      <span>{entry.heroTitle}</span>
                      <span className="text-[10px] font-sans text-brand-muted font-normal">
                        &bull; LVL {entry.level}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-brand-yellow text-sm">
                    {entry.xp} XP
                  </div>
                  <div className="text-[9px] font-mono uppercase text-brand-muted">
                    {entry.tierName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Navigation />
    </div>
  );
}
