"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Keyboard,
  CheckCircle,
  AlertCircle,
  Zap,
  ArrowRight,
  RefreshCw,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { LevelUpModal } from "@/components/LevelUpModal";
import { HeroClashModal } from "@/components/HeroClashModal";
import { useEventSync } from "@/hooks/useEventSync";
import { ClashTactic } from "@/lib/types";

export default function ScannerPage() {
  const router = useRouter();
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<any | null>(null);
  const [leveledUpLevel, setLeveledUpLevel] = useState<number | null>(null);
  const [cameraPermissionError, setCameraPermissionError] = useState<string | null>(null);
  const [useManualMode, setUseManualMode] = useState(false);
  const [isEventActive, setIsEventActive] = useState(true);

  // Clash duel states
  const [showClashModal, setShowClashModal] = useState(false);
  const [activeDuel, setActiveDuel] = useState<any | null>(null);
  const [opponentReady, setOpponentReady] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<{ qrToken?: string; manualCode?: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Fetch current user details for clash HUD
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.participant) {
          setCurrentUser(data);
        }
      })
      .catch(() => {});
  }, []);

  // Sync event config and live duel events in real time
  const { isConnected } = useEventSync({
    onConfigChange: (config) => {
      setIsEventActive(config.is_event_active);
      if (!config.is_event_active) {
        setError("Event scanning is currently paused by organizers.");
      } else {
        setError((prev) => (prev?.includes("paused") ? null : prev));
      }
    },
    onDuelPlayerReady: (payload) => {
      if (
        activeDuel &&
        payload.duelId === activeDuel.duelId &&
        payload.participantId === activeDuel.scannedId
      ) {
        setOpponentReady(true);
      }
    },
    onDuelResolved: (payload) => {
      if (activeDuel && payload.duelId === activeDuel.duelId) {
        setScanResult(payload.scannerResult);
        if (payload.newLevelScanner && payload.newLevelScanner > (currentUser?.participant?.level || 1)) {
          setLeveledUpLevel(payload.newLevelScanner);
        }
      }
    },
  });

  const scannerContainerRef = useRef<HTMLDivElement | null>(null);
  const html5QrCodeRef = useRef<any>(null);

  // Initialize html5-qrcode scanner
  useEffect(() => {
    let isMounted = true;

    async function startScanner() {
      if (useManualMode) return;
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!isMounted) return;

        const scannerId = "qr-reader-container";
        const html5QrCode = new Html5Qrcode(scannerId);
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            initiateScanPayload({ qrToken: decodedText });
          },
          () => {}
        );
        setScanning(true);
      } catch (err: any) {
        console.warn("Camera init note:", err);
        setCameraPermissionError("Camera not accessible on this device or permission denied. Use the manual backup code below!");
        setUseManualMode(true);
      }
    }

    startScanner();

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, [useManualMode]);

  const initiateScanPayload = async (payload: { qrToken?: string; manualCode?: string }) => {
    if (loading) return;
    setError(null);
    setLoading(true);

    // Pause camera while in clash
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        html5QrCodeRef.current.pause();
      } catch {}
    }

    try {
      const res = await fetch("/api/duel/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Scan initialization rejected.");
        setLastPayload(payload);
        setLoading(false);
        if (html5QrCodeRef.current) {
          try {
            html5QrCodeRef.current.resume();
          } catch {}
        }
        return;
      }

      setActiveDuel(data.duelSession);
      setOpponentReady(false);
      setScanResult(null);
      setPendingPayload(payload);
      setShowClashModal(true);
    } catch {
      setError("Network connection issue. Tap below to retry scan.");
      setLastPayload(payload);
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.resume();
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClashTacticSelect = async (tactic: ClashTactic) => {
    if (!activeDuel) return;
    setLoading(true);

    try {
      const res = await fetch("/api/duel/choice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duelId: activeDuel.duelId, tactic }),
      });

      const data = await res.json();
      if (res.ok && data.duelSession?.status === "RESOLVED" && data.duelSession.scannerResult) {
        setScanResult(data.duelSession.scannerResult);
      }
    } catch {
      // Result handled by SSE broadcast
    } finally {
      setLoading(false);
    }
  };

  const handleRetryLastScan = () => {
    if (lastPayload) {
      initiateScanPayload(lastPayload);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    initiateScanPayload({ manualCode: manualCode.trim().toUpperCase() });
  };

  const handleDismissClash = () => {
    setShowClashModal(false);
    setActiveDuel(null);
    setScanResult(null);
    setPendingPayload(null);
    setOpponentReady(false);
    setManualCode("");
    // Resume camera
    if (html5QrCodeRef.current) {
      try {
        html5QrCodeRef.current.resume();
      } catch {}
    }
  };

  return (
    <div className="w-full max-w-md md:max-w-lg mx-auto border-x border-[#2C2C2C] shadow-2xl min-h-screen flex flex-col p-4 bg-[#121212] bg-halftone pb-24">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-yellow" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-brand-white">
            TARGET ACQUISITION HUD
          </span>
          {isConnected && (
            <span className="flex items-center gap-1 text-[9px] font-mono text-green-400 bg-green-950/40 px-1.5 py-0.5 rounded border border-green-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              LIVE
            </span>
          )}
        </div>
        <button
          onClick={() => setUseManualMode(!useManualMode)}
          type="button"
          className="text-xs text-brand-yellow hover:underline flex items-center gap-1 font-mono uppercase"
        >
          {useManualMode ? (
            <>
              <Camera className="w-3.5 h-3.5" /> Use Camera
            </>
          ) : (
            <>
              <Keyboard className="w-3.5 h-3.5" /> Manual Code
            </>
          )}
        </button>
      </div>

      {!isEventActive && (
        <div className="mb-3 p-3 bg-red-950 border-2 border-brand-red rounded-xl text-center animate-pulse">
          <div className="text-brand-red font-comic text-sm uppercase font-bold tracking-wider">
            [!] SCANNING CURRENTLY FROZEN BY ORGANIZERS
          </div>
          <div className="text-[11px] text-red-200 mt-0.5">
            Admin has temporarily paused scoring. Resumes shortly!
          </div>
        </div>
      )}

      {/* Main Viewfinder Frame */}
      <div className="relative bg-[#181818] border-2 border-[#2C2C2C] rounded-2xl overflow-hidden shadow-2xl p-4 mb-4">
        {/* Error message with instant retry */}
        {error && (
          <div className="mb-3 p-3 bg-red-950/90 border border-brand-red text-red-200 text-xs rounded-xl flex flex-col gap-2 animate-comic-pop">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">SCAN STATUS</span>
                <span>{error}</span>
              </div>
            </div>
            {lastPayload && (
              <button
                onClick={handleRetryLastScan}
                disabled={loading}
                type="button"
                className="mt-1 py-1.5 px-3 bg-brand-red hover:bg-red-600 text-white font-mono font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 self-end"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>{loading ? "Retrying..." : "Retry Scan"}</span>
              </button>
            )}
          </div>
        )}

        {/* Camera Viewfinder */}
        {!useManualMode ? (
          <div className="relative flex flex-col items-center justify-center">
            <div
              id="qr-reader-container"
              ref={scannerContainerRef}
              className="w-full max-w-[280px] h-[280px] bg-black rounded-xl overflow-hidden border-2 border-brand-yellow relative shadow-[0_0_20px_rgba(243,240,0,0.2)]"
            />

            {/* Viewfinder Target Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-dashed border-brand-yellow/70 rounded-xl relative animate-pulse">
                {/* Corner markers */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-brand-yellow" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-brand-yellow" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-brand-yellow" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-brand-yellow" />
              </div>
            </div>

            <div className="mt-3 text-center text-xs font-mono text-brand-muted">
              Aim camera directly at another player&apos;s QR code.
            </div>
          </div>
        ) : (
          /* Manual Code Form */
          <div className="py-6 px-2 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-brand-yellow/15 border border-brand-yellow flex items-center justify-center">
              <Keyboard className="w-8 h-8 text-brand-yellow" />
            </div>
            <h3 className="font-comic text-2xl text-white uppercase mb-1">
              ENTER BACKUP CODE
            </h3>
            <p className="text-xs text-brand-muted mb-4 max-w-xs mx-auto">
              If camera is unavailable, enter the backup code shown on their card (e.g. <span className="text-brand-yellow font-mono font-bold">SHK-IRON</span>).
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-3 max-w-xs mx-auto">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="e.g. SHK-XXXX"
                className="w-full px-4 py-3 bg-[#121212] border-2 border-brand-yellow rounded-xl text-center font-mono font-bold text-xl text-brand-yellow tracking-widest uppercase focus:outline-none shadow-comic-sm"
              />
              <button
                type="submit"
                disabled={loading || !manualCode.trim()}
                className="w-full py-3 bg-brand-yellow hover:bg-[#ffe600] active:scale-95 text-black font-comic text-xl uppercase tracking-wider rounded-xl shadow-comic-black border-2 border-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "VALIDATING..." : "SUBMIT SCAN"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          </div>
        )}

        {cameraPermissionError && !useManualMode && (
          <div className="mt-3 p-2.5 bg-[#202020] border border-[#3A3A3A] rounded-lg text-xs text-brand-muted text-center">
            {cameraPermissionError}
          </div>
        )}
      </div>

      {/* Manual Input Trigger */}
      {!useManualMode && (
        <div className="bg-[#181818] border border-[#2A2A2A] p-3 rounded-xl flex items-center justify-between mb-4">
          <div className="text-xs text-brand-muted">
            <span className="font-bold text-white block">Camera having trouble?</span>
            Type backup code manually
          </div>
          <button
            onClick={() => setUseManualMode(true)}
            type="button"
            className="px-3 py-1.5 bg-[#252525] hover:bg-brand-yellow hover:text-black border border-[#3A3A3A] text-brand-white text-xs font-bold uppercase rounded-lg transition-all"
          >
            Enter Code
          </button>
        </div>
      )}

      {/* Hero Power Clash Live 2-Player Battle Modal */}
      {showClashModal && activeDuel && (
        <HeroClashModal
          scannerName={activeDuel.scannerName}
          scannerHero={activeDuel.scannerHero}
          opponentName={activeDuel.scannedName}
          opponentHero={activeDuel.scannedHero}
          role="CHALLENGER"
          opponentReady={opponentReady}
          onSelectTactic={handleClashTacticSelect}
          clashResult={scanResult}
          loading={loading}
          onClose={handleDismissClash}
        />
      )}

      {/* Level Up Banner Popup */}
      {leveledUpLevel && (
        <LevelUpModal
          newLevel={leveledUpLevel}
          onClose={() => setLeveledUpLevel(null)}
        />
      )}

      <Navigation />
    </div>
  );
}
