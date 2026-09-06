"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Zap, Trophy, Sparkles } from "lucide-react";
import { getTierForLevel } from "@/lib/progression";

interface LevelUpModalProps {
  newLevel: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ newLevel, onClose }) => {
  const tier = getTierForLevel(newLevel);

  useEffect(() => {
    // Fire lightweight confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#F3F000", "#E62429", "#00E5FF", "#FFFFFF"],
      });
    } catch {
      // Ignore if canvas-confetti is not loaded
    }
  }, [newLevel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-[#181818] border-4 border-brand-yellow p-6 rounded-2xl shadow-[0_0_50px_rgba(243,240,0,0.5)] text-center animate-comic-pop">
        {/* Comic explosive background burst effect */}
        <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-brand-yellow/20 border-2 border-brand-yellow flex items-center justify-center shadow-[0_0_25px_#F3F000]">
          <Trophy className="w-10 h-10 text-brand-yellow" />
        </div>

        <div className="inline-block px-3 py-1 bg-brand-red text-white text-xs font-black tracking-widest uppercase mb-2 comic-tag">
          <span className="comic-tag-inner flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> POWER SURGE DETECTED
          </span>
        </div>

        <h2 className="font-comic text-5xl tracking-wide text-brand-yellow uppercase drop-shadow-[2px_2px_0px_#000000] mb-1">
          LEVEL UP!
        </h2>

        <div className="text-2xl font-black text-white mb-3">
          YOU REACHED <span className="text-brand-yellow underline">LEVEL {newLevel}</span>
        </div>

        {/* Tier Unlock Card */}
        <div className="bg-[#121212] border border-[#2C2C2C] p-3 rounded-xl mb-5">
          <div className="text-[11px] text-brand-muted uppercase font-bold tracking-wider mb-1">
            Current Combat Tier
          </div>
          <div className="text-lg font-black text-brand-white flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-brand-yellow" />
            <span style={{ color: tier.color }}>{tier.badge}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="w-full py-3.5 bg-brand-yellow hover:bg-[#ffe600] active:scale-95 text-black font-comic text-xl uppercase tracking-wider rounded-lg shadow-comic-black border-2 border-black transition-all"
        >
          CLAIM & CONTINUE
        </button>
      </div>
    </div>
  );
};
