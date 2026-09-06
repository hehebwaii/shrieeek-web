"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  Zap,
  Sparkles,
  Shield,
  Award,
  Users,
  Calendar,
  X,
  ArrowRight,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { CodexEntry } from "@/lib/types";
import { HeroArtwork } from "@/components/HeroArtwork";
import { Navigation } from "@/components/Navigation";
import { useEventSync } from "@/hooks/useEventSync";

export default function AllianceCodexPage() {
  const router = useRouter();
  const [codex, setCodex] = useState<CodexEntry[]>([]);
  const [totalHeroes, setTotalHeroes] = useState<number>(164);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [inspectedHero, setInspectedHero] = useState<CodexEntry | null>(null);

  const fetchCodex = async () => {
    try {
      const res = await fetch("/api/codex");
      if (res.status === 401) {
        router.push("/");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setCodex(data.codex || []);
        if (data.totalHeroes) setTotalHeroes(data.totalHeroes);
      }
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodex();
  }, []);

  // Real-time updates when scans occur
  useEventSync({
    onScanAwarded: () => {
      fetchCodex();
    },
  });

  const filteredCodex = useMemo(() => {
    return codex.filter((entry) => {
      const char = entry.character;
      const matchesSearch =
        entry.display_name.toLowerCase().includes(search.toLowerCase()) ||
        char?.heroTitle.toLowerCase().includes(search.toLowerCase()) ||
        entry.powers.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedFilter === "ALL") return true;
      if (selectedFilter === "MUTUAL") return entry.is_mutual_ally;
      if (char?.combatClass === selectedFilter) return true;

      return false;
    });
  }, [codex, search, selectedFilter]);

  const progressPercent = totalHeroes > 0 ? Math.min(100, Math.round((codex.length / totalHeroes) * 100)) : 0;
  const mutualAlliesCount = codex.filter((c) => c.is_mutual_ally).length;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Today";
    }
  };

  return (
    <div className="w-full max-w-md md:max-w-lg mx-auto border-x border-[#2C2C2C] shadow-2xl min-h-screen flex flex-col p-4 bg-[#121212] bg-halftone pb-24">
      {/* Top Header */}
      <div className="text-center mb-4">
        <div className="inline-block px-3 py-0.5 bg-brand-yellow text-black font-comic text-xs uppercase tracking-widest comic-tag border border-black shadow-comic-sm mb-1.5">
          <span className="comic-tag-inner font-bold">ALLIANCE ROSTER</span>
        </div>
        <h1 className="font-comic text-3xl sm:text-4xl text-brand-yellow uppercase tracking-wide drop-shadow-[2px_2px_0px_#000]">
          HERO CODEX
        </h1>
        <p className="text-xs font-mono text-brand-muted">
          Your personal collection of discovered superhero peers
        </p>
      </div>

      {/* Discovery Progress Tracker Card */}
      <div className="bg-[#181818] border-2 border-[#2C2C2C] p-4 rounded-2xl shadow-xl mb-4 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-yellow" />
            <span className="text-xs font-mono font-bold uppercase text-brand-white">
              DISCOVERY PROGRESS
            </span>
          </div>
          <span className="font-comic text-sm text-brand-yellow">
            {codex.length} / {totalHeroes} HEROES ({progressPercent}%)
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full h-3 bg-black rounded-full overflow-hidden border border-[#333333] p-0.5">
          <div
            className="h-full bg-gradient-to-r from-brand-red via-brand-yellow to-green-400 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(243,240,0,0.5)]"
            style={{ width: `${Math.max(4, progressPercent)}%` }}
          />
        </div>

        {/* Quick Stats Badges */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-[#252525] text-center">
          <div className="bg-[#121212] p-2 rounded-xl border border-[#222222]">
            <span className="text-[10px] font-mono text-brand-muted uppercase block font-bold">
              HEROES COLLECTED
            </span>
            <span className="font-comic text-xl text-white">
              {codex.length}
            </span>
          </div>
          <div className="bg-[#121212] p-2 rounded-xl border border-[#222222]">
            <span className="text-[10px] font-mono text-brand-muted uppercase block font-bold">
              MUTUAL ALLIES ⚡
            </span>
            <span className="font-comic text-xl text-green-400">
              {mutualAlliesCount}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2 mb-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, hero or superpower..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#181818] border-2 border-[#2C2C2C] focus:border-brand-yellow focus:outline-none rounded-xl text-xs text-white placeholder-brand-muted font-sans transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "ALL", label: "ALL" },
            { id: "MUTUAL", label: "MUTUAL ⚡" },
            { id: "MIGHT", label: "MIGHT" },
            { id: "TECH", label: "TECH" },
            { id: "COSMIC", label: "COSMIC" },
            { id: "MARTIAL", label: "MARTIAL" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase whitespace-nowrap transition-all ${
                selectedFilter === tab.id
                  ? "bg-brand-yellow text-black shadow-comic-sm scale-102"
                  : "bg-[#1C1C1C] text-brand-muted hover:text-white border border-[#2E2E2E]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Codex Roster Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-3 border-brand-yellow border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-brand-muted uppercase tracking-widest">
            Opening Alliance Codex...
          </span>
        </div>
      ) : filteredCodex.length === 0 ? (
        <div className="py-12 px-4 text-center bg-[#161616] border-2 border-dashed border-[#2C2C2C] rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-brand-yellow/10 border border-brand-yellow/40 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6 text-brand-yellow" />
          </div>
          <h3 className="font-comic text-xl text-white uppercase mb-1">
            {search || selectedFilter !== "ALL" ? "NO MATCHES FOUND" : "CODEX IS EMPTY"}
          </h3>
          <p className="text-xs text-brand-muted max-w-xs mx-auto mb-4">
            {search || selectedFilter !== "ALL"
              ? "Try adjusting your search query or filter."
              : "Scan other attendees' QR codes to discover their superhero cards and add them to your Alliance Codex!"}
          </p>
          {!search && selectedFilter === "ALL" && (
            <button
              onClick={() => router.push("/scan")}
              className="py-2.5 px-5 bg-brand-yellow hover:bg-[#ffe600] active:scale-95 text-black font-comic text-base uppercase tracking-wider rounded-xl shadow-comic-black border-2 border-black inline-flex items-center gap-1.5 transition-all"
            >
              Go to Scanner <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredCodex.map((entry) => {
            const char = entry.character;
            return (
              <div
                key={entry.id}
                onClick={() => setInspectedHero(entry)}
                className="bg-[#181818] border-2 border-[#2C2C2C] hover:border-brand-yellow/80 p-3 rounded-2xl cursor-pointer transition-all hover:scale-101 shadow-md hover:shadow-[0_0_20px_rgba(243,240,0,0.15)] flex flex-col justify-between relative group"
              >
                {/* Mutual Ally Badge */}
                {entry.is_mutual_ally && (
                  <div className="absolute -top-2 -right-1 bg-green-500 text-black text-[9px] font-comic font-black uppercase px-2 py-0.5 rounded-full border border-black shadow-comic-sm z-10 animate-pulse flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5 fill-black" /> MUTUAL ALLY
                  </div>
                )}

                <div className="flex items-start gap-3 mb-2">
                  {/* Avatar Artwork */}
                  <div className="w-14 h-14 rounded-xl border border-brand-yellow/50 overflow-hidden flex-shrink-0 bg-black relative">
                    <HeroArtwork
                      characterId={entry.character_id}
                      className="w-14 h-14 object-cover"
                    />
                    <div className="absolute bottom-0 right-0 bg-brand-red text-white text-[8px] font-comic px-1 rounded-tl font-bold">
                      L{entry.level || 1}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-comic text-base text-white uppercase truncate group-hover:text-brand-yellow transition-colors">
                      {char?.heroTitle || "SUPERHERO"}
                    </div>
                    <div className="text-xs font-sans font-bold text-brand-yellow uppercase truncate">
                      {entry.display_name}
                    </div>
                    <div className="text-[10px] font-mono text-brand-muted truncate mt-0.5">
                      {char?.combatClass || "MARTIAL"} Class
                    </div>
                  </div>
                </div>

                {/* Powers Snippet */}
                <div className="bg-[#121212] border border-[#242424] p-2 rounded-lg text-[11px] text-brand-muted line-clamp-2 leading-tight mb-2">
                  {entry.powers || char?.defaultPowers || "Classified superhero abilities."}
                </div>

                {/* Footer Timestamp & Inspect Hint */}
                <div className="flex items-center justify-between text-[9px] font-mono text-brand-muted pt-1 border-t border-[#222222]">
                  <span>Scanned {formatDate(entry.scanned_at)}</span>
                  <span className="text-brand-yellow group-hover:underline">Dossier →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Superpower Dossier Inspection Modal */}
      {inspectedHero && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-[#161616] border-3 border-brand-yellow rounded-3xl shadow-[0_0_50px_rgba(243,240,0,0.25)] p-5 sm:p-6 text-center relative overflow-hidden my-auto animate-comic-pop">
            <div className="absolute inset-0 bg-halftone opacity-35 pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setInspectedHero(null)}
              className="absolute top-4 right-4 text-brand-muted hover:text-white p-1 rounded-lg bg-[#222222] border border-[#333333] z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Top Comic Tag */}
            <div className="relative z-10 mb-3">
              <div className="inline-block px-3 py-0.5 bg-brand-red text-white font-comic text-xs uppercase tracking-widest comic-tag border border-black shadow-comic-sm mb-1.5">
                <span className="comic-tag-inner font-bold">ALLIANCE DOSSIER</span>
              </div>
              <h2 className="font-comic text-3xl text-brand-yellow uppercase tracking-wide">
                {inspectedHero.character?.heroTitle || "SUPERHERO"}
              </h2>
              <div className="text-sm font-sans font-bold text-white uppercase">
                {inspectedHero.display_name}
              </div>
            </div>

            {/* Hero Artwork */}
            <div className="w-28 h-28 mx-auto mb-3 relative z-10">
              <HeroArtwork
                characterId={inspectedHero.character_id}
                className="w-28 h-28 rounded-2xl border-2 border-brand-yellow shadow-comic-sm"
              />
              <div className="absolute -bottom-1 -right-1 bg-brand-red border border-white text-white text-xs font-comic px-2 py-0.5 rounded-lg font-bold shadow-comic-sm">
                LEVEL {inspectedHero.level || 1}
              </div>
            </div>

            {/* Mutual Alliance Status */}
            {inspectedHero.is_mutual_ally ? (
              <div className="relative z-10 mb-3 p-2 bg-green-950/80 border border-green-500 rounded-xl flex items-center justify-center gap-1.5 text-green-400 font-comic text-xs uppercase tracking-wider">
                <Zap className="w-4 h-4 fill-green-400" /> Mutual Ally — You both scanned each other!
              </div>
            ) : (
              <div className="relative z-10 mb-3 p-2 bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl text-brand-muted font-mono text-[10px]">
                Tip: If {inspectedHero.display_name} scans your card, you will become Mutual Allies!
              </div>
            )}

            {/* Superpower Description */}
            <div className="relative z-10 bg-[#101010] border border-[#282828] p-3 rounded-xl text-left mb-3">
              <div className="text-[10px] font-mono text-brand-yellow font-bold uppercase mb-1 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> SUPERPOWER PROFILE
              </div>
              <p className="text-xs text-white leading-relaxed">
                {inspectedHero.powers || inspectedHero.character?.defaultPowers || "Classified superhero powers."}
              </p>
            </div>

            {/* Combat Class & Universe Meta */}
            <div className="relative z-10 grid grid-cols-2 gap-2 text-left text-[11px] font-mono text-brand-muted mb-4">
              <div className="bg-[#101010] p-2 rounded-lg border border-[#222222]">
                <span className="block text-[9px] text-brand-muted uppercase">Combat Class</span>
                <span className="text-brand-yellow font-bold">{inspectedHero.character?.combatClass || "MARTIAL"}</span>
              </div>
              <div className="bg-[#101010] p-2 rounded-lg border border-[#222222]">
                <span className="block text-[9px] text-brand-muted uppercase">Special Move</span>
                <span className="text-white font-bold truncate block">{inspectedHero.character?.specialMove || "Titan Burst"}</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setInspectedHero(null)}
              className="relative z-10 w-full py-3 bg-brand-yellow hover:bg-[#ffe600] active:scale-95 text-black font-comic text-lg uppercase tracking-wider rounded-xl shadow-comic-black border-2 border-black transition-all"
            >
              CLOSE DOSSIER
            </button>
          </div>
        </div>
      )}

      <Navigation />
    </div>
  );
}
