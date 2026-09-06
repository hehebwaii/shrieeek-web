"use client";

import React, { useState, useEffect } from "react";
import { ClashTactic, ClashResult } from "@/lib/types";
import { Zap, Shield, Swords, Sparkles, Award, ArrowRight, RotateCcw, Check } from "lucide-react";

interface HeroClashModalProps {
  scannerName: string;
  scannerHero: string;
  opponentName: string;
  opponentHero: string;
  role?: "CHALLENGER" | "DEFENDER";
  opponentReady?: boolean;
  onSelectTactic: (tactic: ClashTactic) => void;
  clashResult?: ClashResult | null;
  loading?: boolean;
  onClose: () => void;
}

export function HeroClashModal({
  scannerName,
  scannerHero,
  opponentName,
  opponentHero,
  role = "CHALLENGER",
  opponentReady = false,
  onSelectTactic,
  clashResult,
  loading = false,
  onClose,
}: HeroClashModalProps) {
  const [selectedTactic, setSelectedTactic] = useState<ClashTactic | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [showAnimation, setShowAnimation] = useState(false);

  // Auto-countdown (10 seconds)
  useEffect(() => {
    if (selectedTactic || clashResult) return;

    if (timeLeft <= 0) {
      handleChooseTactic("STRIKE");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, selectedTactic, clashResult]);

  const handleChooseTactic = (tactic: ClashTactic) => {
    if (selectedTactic) return;
    setSelectedTactic(tactic);
    setShowAnimation(true);
    onSelectTactic(tactic);
  };

  const getTacticIcon = (tactic?: ClashTactic) => {
    switch (tactic) {
      case "STRIKE":
        return <Swords className="w-5 h-5 text-red-400" />;
      case "SHIELD":
        return <Shield className="w-5 h-5 text-cyan-400" />;
      case "BLITZ":
        return <Zap className="w-5 h-5 text-brand-yellow" />;
      default:
        return null;
    }
  };

  const isChallenger = role === "CHALLENGER";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md bg-[#161616] border-3 border-brand-yellow rounded-3xl shadow-[0_0_50px_rgba(243,240,0,0.25)] p-5 sm:p-6 text-center relative overflow-hidden my-auto">
        {/* Halftone comic texture overlay */}
        <div className="absolute inset-0 bg-halftone opacity-30 pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 mb-4">
          <div className="inline-block px-3 py-0.5 bg-brand-red text-white font-comic text-xs uppercase tracking-widest comic-tag border border-black shadow-comic-sm mb-1.5">
            <span className="comic-tag-inner">
              {isChallenger ? "⚔️ LIVE COMBAT DUEL" : "🛡️ DEFENSE DUEL CHALLENGE"}
            </span>
          </div>
          <h2 className="font-comic text-3xl sm:text-4xl text-brand-yellow uppercase tracking-wide drop-shadow-[2px_2px_0px_#000]">
            ⚡ HERO POWER CLASH ⚡
          </h2>
          <p className="text-[11px] font-mono text-brand-muted">
            {isChallenger
              ? "You initiated a live duel! Select your combat stance to win bonus XP!"
              : "A challenger has scanned your card! Pick your defense stance!"}
          </p>
        </div>

        {/* VS Hero Showcase Arena */}
        <div className="relative z-10 grid grid-cols-2 gap-2 sm:gap-3 bg-[#101010] border-2 border-[#282828] p-3 rounded-2xl mb-4">
          {/* Challenger Side */}
          <div
            className={`border-2 rounded-xl p-2.5 flex flex-col items-center ${
              isChallenger
                ? "bg-[#1C1A00] border-brand-yellow/80"
                : "bg-[#141414] border-[#333333]"
            }`}
          >
            <span
              className={`text-[9px] font-mono uppercase tracking-widest font-bold mb-1 ${
                isChallenger ? "text-brand-yellow" : "text-brand-muted"
              }`}
            >
              {isChallenger ? "CHALLENGER (YOU)" : "CHALLENGER"}
            </span>
            <div className="font-comic text-lg text-white uppercase truncate w-full">
              {scannerHero}
            </div>
            <div className="text-[11px] font-sans text-brand-muted truncate w-full">
              {scannerName}
            </div>
            {isChallenger && selectedTactic && (
              <div className="mt-2 flex items-center gap-1 text-[10px] font-mono font-bold text-brand-yellow bg-black/60 px-2 py-0.5 rounded border border-brand-yellow/40">
                {getTacticIcon(selectedTactic)}
                <span>{selectedTactic}</span>
              </div>
            )}
            {!isChallenger && clashResult && (
              <div className="mt-2 flex items-center gap-1 text-[10px] font-mono font-bold text-brand-yellow bg-black/60 px-2 py-0.5 rounded border border-brand-yellow/40">
                {getTacticIcon(clashResult.opponentTactic)}
                <span>{clashResult.opponentTactic}</span>
              </div>
            )}
            {!isChallenger && !clashResult && (
              <div className="mt-2 text-[9px] font-mono text-brand-muted">
                {opponentReady ? (
                  <span className="text-green-400 font-bold flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> READY
                  </span>
                ) : (
                  <span className="animate-pulse">DECIDING...</span>
                )}
              </div>
            )}
          </div>

          {/* VS Badge Center */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-brand-red border-2 border-white flex items-center justify-center font-comic font-black text-xs text-white shadow-comic-sm z-20">
            VS
          </div>

          {/* Defender Side */}
          <div
            className={`border-2 rounded-xl p-2.5 flex flex-col items-center ${
              !isChallenger
                ? "bg-[#1C1A00] border-brand-yellow/80"
                : "bg-[#141414] border-[#333333]"
            }`}
          >
            <span
              className={`text-[9px] font-mono uppercase tracking-widest font-bold mb-1 ${
                !isChallenger ? "text-brand-yellow" : "text-brand-muted"
              }`}
            >
              {!isChallenger ? "DEFENDER (YOU)" : "DEFENDER"}
            </span>
            <div className="font-comic text-lg text-white uppercase truncate w-full">
              {opponentHero}
            </div>
            <div className="text-[11px] font-sans text-brand-muted truncate w-full">
              {opponentName}
            </div>
            {!isChallenger && selectedTactic && (
              <div className="mt-2 flex items-center gap-1 text-[10px] font-mono font-bold text-brand-yellow bg-black/60 px-2 py-0.5 rounded border border-brand-yellow/40">
                {getTacticIcon(selectedTactic)}
                <span>{selectedTactic}</span>
              </div>
            )}
            {isChallenger && clashResult && (
              <div className="mt-2 flex items-center gap-1 text-[10px] font-mono font-bold text-red-400 bg-black/60 px-2 py-0.5 rounded border border-red-500/40">
                {getTacticIcon(clashResult.opponentTactic)}
                <span>{clashResult.opponentTactic}</span>
              </div>
            )}
            {isChallenger && !clashResult && (
              <div className="mt-2 text-[9px] font-mono text-brand-muted">
                {opponentReady ? (
                  <span className="text-green-400 font-bold flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> READY
                  </span>
                ) : (
                  <span className="animate-pulse">DECIDING...</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Phase 1: Choosing Tactic */}
        {!clashResult && (
          <div className="relative z-10">
            <div className="flex items-center justify-between text-xs font-mono text-brand-muted mb-2 px-1">
              <span>{selectedTactic ? "STANCE LOCKED" : "SELECT YOUR STANCE"}</span>
              <span className="font-bold text-brand-yellow">
                ⏱️ {timeLeft}s remaining
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {/* STRIKE */}
              <button
                onClick={() => handleChooseTactic("STRIKE")}
                disabled={loading || Boolean(selectedTactic)}
                type="button"
                className={`p-3 bg-[#1E1212] hover:bg-[#2D1616] active:scale-95 border-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  selectedTactic === "STRIKE"
                    ? "border-red-500 shadow-[0_0_15px_#ef4444] scale-102"
                    : "border-[#3A2222] hover:border-red-500/60"
                }`}
              >
                <Swords className="w-6 h-6 text-red-400" />
                <span className="font-comic text-sm text-white uppercase">STRIKE</span>
                <span className="text-[8px] font-mono text-red-300">Beats Shield</span>
              </button>

              {/* SHIELD */}
              <button
                onClick={() => handleChooseTactic("SHIELD")}
                disabled={loading || Boolean(selectedTactic)}
                type="button"
                className={`p-3 bg-[#0E1A22] hover:bg-[#142633] active:scale-95 border-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  selectedTactic === "SHIELD"
                    ? "border-cyan-400 shadow-[0_0_15px_#22d3ee] scale-102"
                    : "border-[#1F3340] hover:border-cyan-400/60"
                }`}
              >
                <Shield className="w-6 h-6 text-cyan-400" />
                <span className="font-comic text-sm text-white uppercase">SHIELD</span>
                <span className="text-[8px] font-mono text-cyan-300">Blocks Blitz</span>
              </button>

              {/* BLITZ */}
              <button
                onClick={() => handleChooseTactic("BLITZ")}
                disabled={loading || Boolean(selectedTactic)}
                type="button"
                className={`p-3 bg-[#242004] hover:bg-[#332D06] active:scale-95 border-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  selectedTactic === "BLITZ"
                    ? "border-brand-yellow shadow-[0_0_15px_#f3f000] scale-102"
                    : "border-[#403910] hover:border-brand-yellow/60"
                }`}
              >
                <Zap className="w-6 h-6 text-brand-yellow" />
                <span className="font-comic text-sm text-white uppercase">BLITZ</span>
                <span className="text-[8px] font-mono text-yellow-300">Counters Strike</span>
              </button>
            </div>

            {selectedTactic && !clashResult && (
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-brand-yellow animate-pulse py-2 bg-[#121212] rounded-xl border border-brand-yellow/30">
                <RotateCcw className="w-4 h-4 animate-spin text-brand-yellow" />
                <span>
                  {opponentReady
                    ? "BOTH PLAYERS LOCKED! RESOLVING CLASH..."
                    : "STANCE LOCKED! WAITING FOR OPPONENT..."}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Phase 2: Clash Result Revealed */}
        {clashResult && (
          <div className="relative z-10 animate-comic-pop">
            {/* Outcome Badge */}
            <div className="mb-3">
              {clashResult.outcome === "VICTORY" ? (
                <div className="inline-block px-4 py-1.5 bg-green-500 text-black font-comic text-xl uppercase tracking-wider rounded-xl shadow-comic-black border-2 border-black animate-bounce">
                  🏆 HEROIC VICTORY! +{clashResult.totalXpAwarded} XP!
                </div>
              ) : clashResult.outcome === "DRAW" ? (
                <div className="inline-block px-4 py-1.5 bg-amber-500 text-black font-comic text-xl uppercase tracking-wider rounded-xl shadow-comic-black border-2 border-black">
                  ⚔️ POWER DRAW! +{clashResult.totalXpAwarded} XP
                </div>
              ) : (
                <div className="inline-block px-4 py-1.5 bg-cyan-500 text-black font-comic text-xl uppercase tracking-wider rounded-xl shadow-comic-black border-2 border-black">
                  🛡️ DEFENDED! +{clashResult.totalXpAwarded} XP
                </div>
              )}
            </div>

            {/* Impact Details Box */}
            <div className="bg-[#121212] border border-[#2C2C2C] p-3.5 rounded-xl mb-4 text-left">
              <p className="text-xs font-comic text-brand-yellow leading-relaxed mb-2">
                {clashResult.impactPhrase}
              </p>
              <div className="flex justify-between items-center text-[10px] font-mono text-brand-muted pt-2 border-t border-[#222222]">
                <span>Base Scan: +10 XP</span>
                <span className="text-green-400 font-bold">
                  {clashResult.bonusXp > 0 ? `+${clashResult.bonusXp} XP Clash Bonus` : "Standard +10 XP"}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="w-full py-3.5 bg-brand-yellow hover:bg-[#ffe600] active:scale-95 text-black font-comic text-xl uppercase tracking-wider rounded-xl shadow-comic-black border-2 border-black transition-all flex items-center justify-center gap-2"
            >
              CONTINUE COMBAT <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
