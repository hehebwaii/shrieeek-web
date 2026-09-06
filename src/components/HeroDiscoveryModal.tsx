"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CharacterInfo } from "@/lib/types";
import { HeroArtwork } from "./HeroArtwork";
import { Zap, BookOpen, Camera, Sparkles, Award, ArrowRight } from "lucide-react";

interface HeroDiscoveryModalProps {
  scannedParticipant: {
    id: string;
    display_name: string;
    powers: string;
    character_id: string | null;
    level: number;
    character?: CharacterInfo | null;
  };
  xpAwarded: number;
  onClose: () => void;
}

export function HeroDiscoveryModal({
  scannedParticipant,
  xpAwarded = 15,
  onClose,
}: HeroDiscoveryModalProps) {
  const router = useRouter();
  const hero = scannedParticipant.character;

  const handleGoToCodex = () => {
    onClose();
    router.push("/codex");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md bg-[#161616] border-3 border-brand-yellow rounded-3xl shadow-[0_0_60px_rgba(243,240,0,0.3)] p-5 sm:p-6 text-center relative overflow-hidden my-auto animate-comic-pop">
        {/* Halftone comic texture overlay */}
        <div className="absolute inset-0 bg-halftone opacity-35 pointer-events-none" />

        {/* Top Comic Tag */}
        <div className="relative z-10 mb-2">
          <div className="inline-block px-3 py-0.5 bg-green-500 text-black font-comic text-xs uppercase tracking-widest comic-tag border border-black shadow-comic-sm mb-1.5 animate-bounce">
            <span className="comic-tag-inner font-black">⚡ NEW HERO DISCOVERED! ⚡</span>
          </div>
          <h2 className="font-comic text-3xl sm:text-4xl text-brand-yellow uppercase tracking-wide drop-shadow-[2px_2px_0px_#000]">
            ALLIANCE UNLOCKED
          </h2>
          <p className="text-xs font-mono text-brand-muted">
            Added to your personal Hero Alliance Codex!
          </p>
        </div>

        {/* Hero Card Showcase */}
        <div className="relative z-10 bg-[#101010] border-2 border-brand-yellow/80 rounded-2xl p-4 my-3 text-center shadow-[0_0_20px_rgba(243,240,0,0.15)]">
          {/* Hero Avatar / Artwork */}
          <div className="w-24 h-24 mx-auto mb-2 relative">
            <HeroArtwork
              characterId={scannedParticipant.character_id}
              className="w-24 h-24 rounded-2xl border-2 border-brand-yellow shadow-comic-sm"
            />
            <div className="absolute -bottom-1 -right-1 bg-brand-red border border-white text-white text-[10px] font-comic px-1.5 py-0.2 rounded font-bold shadow-comic-sm">
              LVL {scannedParticipant.level || 1}
            </div>
          </div>

          {/* Hero Title & Real Name */}
          <div className="font-comic text-2xl text-white uppercase tracking-wider mb-0.5">
            {hero?.heroTitle || "SUPERHERO"}
          </div>
          <div className="text-sm font-sans font-bold text-brand-yellow uppercase mb-2">
            {scannedParticipant.display_name}
          </div>

          {/* Superpower Description */}
          <div className="bg-[#181818] border border-[#2C2C2C] p-2.5 rounded-xl text-left mb-2">
            <div className="text-[9px] font-mono uppercase text-brand-muted font-bold mb-0.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-brand-yellow" /> SUPERPOWER TRAITS
            </div>
            <p className="text-xs text-brand-white leading-relaxed line-clamp-3">
              {scannedParticipant.powers || hero?.defaultPowers || "Classified superhero powers."}
            </p>
          </div>

          {/* Combat Class & Universe Badge */}
          <div className="flex items-center justify-between text-[10px] font-mono text-brand-muted px-1">
            <span className="bg-[#242004] text-brand-yellow px-2 py-0.5 rounded border border-brand-yellow/30 font-bold">
              {hero?.combatClass || "MARTIAL"} CLASS
            </span>
            <span>{hero?.universe || "EARTH-616"}</span>
          </div>
        </div>

        {/* XP Award Banner */}
        <div className="relative z-10 mb-4 p-2.5 bg-green-950/80 border border-green-500 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-left">
            <Award className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] font-mono text-green-300 block font-bold">ALLIANCE REWARD</span>
              <span className="text-xs font-comic text-white uppercase">Discovery Bonus</span>
            </div>
          </div>
          <span className="font-comic text-xl text-green-400 drop-shadow">
            +{xpAwarded} XP
          </span>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-2">
          <button
            onClick={onClose}
            type="button"
            className="flex-1 py-3 bg-[#242424] hover:bg-[#303030] text-white font-comic text-lg uppercase tracking-wider rounded-xl border-2 border-[#3C3C3C] transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Camera className="w-4 h-4 text-brand-yellow" /> Scan Next
          </button>
          <button
            onClick={handleGoToCodex}
            type="button"
            className="flex-1 py-3 bg-brand-yellow hover:bg-[#ffe600] active:scale-95 text-black font-comic text-lg uppercase tracking-wider rounded-xl shadow-comic-black border-2 border-black transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-black" /> View in Codex
          </button>
        </div>
      </div>
    </div>
  );
}
