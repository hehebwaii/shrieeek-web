import React from "react";
import { Zap, Shield, Flame, Activity, Crosshair, Sparkles, Compass, Swords } from "lucide-react";

interface HeroArtworkProps {
  heroId: string;
  className?: string;
}

export const HeroArtwork: React.FC<HeroArtworkProps> = ({ heroId, className = "" }) => {
  switch (heroId) {
    case "iron-man":
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#8B0000] via-[#500000] to-[#1a0000] overflow-hidden ${className}`}>
          {/* Tech Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e6242915_1px,transparent_1px),linear-gradient(to_bottom,#e6242915_1px,transparent_1px)] bg-[size:16px_16px]" />
          {/* Arc Reactor Glow */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-4 border-cyan-400 bg-cyan-950/80 flex items-center justify-center shadow-[0_0_35px_#00e5ff] animate-pulse">
              <div className="w-14 h-14 rounded-full border-2 border-white bg-cyan-300/40 flex items-center justify-center">
                <Crosshair className="w-8 h-8 text-white drop-shadow-[0_0_8px_#ffffff]" />
              </div>
            </div>
            <div className="mt-3 px-3 py-1 bg-black/70 border border-brand-red rounded text-[10px] font-mono tracking-widest text-cyan-300">
              MK-85 ARC CORE ONLINE
            </div>
          </div>
        </div>
      );

    case "thor":
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#0f2b48] via-[#081729] to-[#040c14] overflow-hidden ${className}`}>
          <div className="absolute inset-0 bg-halftone opacity-30" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-2xl border-4 border-cyan-400 bg-cyan-900/60 flex items-center justify-center shadow-[0_0_35px_#00e5ff]">
              <Zap className="w-14 h-14 text-brand-yellow drop-shadow-[0_0_12px_#F3F000]" />
            </div>
            <div className="mt-3 px-3 py-1 bg-black/70 border border-cyan-400 rounded text-[10px] font-mono tracking-widest text-cyan-200">
              MJÖLNIR THUNDER SURGE
            </div>
          </div>
        </div>
      );

    case "hulk":
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#14532d] via-[#064e3b] to-[#022c22] overflow-hidden ${className}`}>
          <div className="absolute inset-0 bg-halftone-dense opacity-40" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-4 border-green-400 bg-green-950 flex items-center justify-center shadow-[0_0_35px_#22c55e]">
              <Activity className="w-14 h-14 text-green-400 drop-shadow-[0_0_10px_#22c55e]" />
            </div>
            <div className="mt-3 px-3 py-1 bg-black/70 border border-green-500 rounded text-[10px] font-mono tracking-widest text-green-300">
              GAMMA KINETIC OVERLOAD
            </div>
          </div>
        </div>
      );

    case "spiderman":
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#7f1d1d] via-[#450a0a] to-[#1e1b4b] overflow-hidden ${className}`}>
          <div className="absolute inset-0 bg-halftone opacity-30" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-4 border-brand-red bg-red-950/80 flex items-center justify-center shadow-[0_0_35px_#ff2a2a]">
              <Shield className="w-14 h-14 text-white drop-shadow-[0_0_10px_#ff2a2a]" />
            </div>
            <div className="mt-3 px-3 py-1 bg-black/70 border border-red-500 rounded text-[10px] font-mono tracking-widest text-red-200">
              SPIDER-SENSE ACTIVE
            </div>
          </div>
        </div>
      );

    case "black-panther":
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#3b0764] via-[#1e1b4b] to-[#0f172a] overflow-hidden ${className}`}>
          <div className="absolute inset-0 bg-halftone opacity-25" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-2xl border-4 border-purple-500 bg-purple-950 flex items-center justify-center shadow-[0_0_35px_#a855f7]">
              <Sparkles className="w-14 h-14 text-purple-300 drop-shadow-[0_0_10px_#a855f7]" />
            </div>
            <div className="mt-3 px-3 py-1 bg-black/70 border border-purple-500 rounded text-[10px] font-mono tracking-widest text-purple-300">
              VIBRANIUM HABIT ARMED
            </div>
          </div>
        </div>
      );

    case "captain-marvel":
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#78350f] via-[#451a03] to-[#1c1917] overflow-hidden ${className}`}>
          <div className="absolute inset-0 bg-halftone opacity-30" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-4 border-amber-400 bg-amber-950 flex items-center justify-center shadow-[0_0_35px_#f59e0b]">
              <Flame className="w-14 h-14 text-brand-yellow drop-shadow-[0_0_12px_#f59e0b]" />
            </div>
            <div className="mt-3 px-3 py-1 bg-black/70 border border-amber-400 rounded text-[10px] font-mono tracking-widest text-amber-200">
              BINARY PHOTON CHARGED
            </div>
          </div>
        </div>
      );

    case "doctor-strange":
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#500724] via-[#3b0764] to-[#0f172a] overflow-hidden ${className}`}>
          <div className="absolute inset-0 bg-halftone opacity-30" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-4 border-pink-500 bg-pink-950 flex items-center justify-center shadow-[0_0_35px_#ec4899]">
              <Compass className="w-14 h-14 text-pink-300 drop-shadow-[0_0_10px_#ec4899]" />
            </div>
            <div className="mt-3 px-3 py-1 bg-black/70 border border-pink-500 rounded text-[10px] font-mono tracking-widest text-pink-200">
              MYSTIC SANCTUM SHIELD
            </div>
          </div>
        </div>
      );

    case "wolverine":
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#713f12] via-[#422006] to-[#1c1917] overflow-hidden ${className}`}>
          <div className="absolute inset-0 bg-halftone opacity-30" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-2xl border-4 border-yellow-500 bg-yellow-950 flex items-center justify-center shadow-[0_0_35px_#fbbf24]">
              <Swords className="w-14 h-14 text-yellow-400 drop-shadow-[0_0_10px_#fbbf24]" />
            </div>
            <div className="mt-3 px-3 py-1 bg-black/70 border border-yellow-500 rounded text-[10px] font-mono tracking-widest text-yellow-300">
              ADAMANTIUM CLAWS DRAWN
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className={`relative flex items-center justify-center bg-[#1B1B1B] ${className}`}>
          <Zap className="w-16 h-16 text-brand-yellow" />
        </div>
      );
  }
};
