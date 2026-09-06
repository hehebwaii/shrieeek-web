"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  Edit3,
  Dices,
  CheckCircle,
  QrCode,
  Sparkles,
  Trophy,
  AlertCircle,
  WifiOff,
} from "lucide-react";
import { Participant, CharacterInfo } from "@/lib/types";
import { getTierForLevel, getXpInCurrentLevel, getXpProgressPercent } from "@/lib/progression";
import { HeroArtwork } from "@/components/HeroArtwork";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { Navigation } from "@/components/Navigation";
import { useEventSync } from "@/hooks/useEventSync";
import Link from "next/link";

export default function CharacterCardPage() {
  const router = useRouter();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [character, setCharacter] = useState<CharacterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPowers, setEditPowers] = useState("");
  const [saving, setSaving] = useState(false);

  // Re-roll action state
  const [rerolling, setRerolling] = useState(false);
  const [rerollMessage, setRerollMessage] = useState<string | null>(null);

  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Load from local storage immediately for 0ms offline display
  useEffect(() => {
    try {
      const cached = localStorage.getItem("shrieeek_card_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.participant && parsed.character) {
          setParticipant(parsed.participant);
          setCharacter(parsed.character);
          setEditName(parsed.participant.display_name);
          setEditPowers(parsed.participant.powers);
          setLoading(false);
        }
      }
    } catch {}
  }, []);

  const fetchSession = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout for poor networks

      const res = await fetch("/api/auth/me", { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status === 401 && !localStorage.getItem("shrieeek_card_cache")) {
          router.push("/");
          return;
        }
        return;
      }
      const data = await res.json();
      if (data.participant) {
        setParticipant(data.participant);
        setCharacter(data.character);
        setEditName(data.participant.display_name);
        setEditPowers(data.participant.powers);
        setIsOfflineMode(false);
        // Save to offline storage
        try {
          localStorage.setItem("shrieeek_card_cache", JSON.stringify(data));
        } catch {}
      }
    } catch (err) {
      console.log("Offline or slow network detected, using stored card cache.");
      setIsOfflineMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  // Real-time synchronization for Admin Resets and Scans
  useEventSync({
    onParticipantReset: (payload) => {
      if (!payload?.participantId || payload.participantId === participant?.id) {
        try {
          localStorage.removeItem("shrieeek_card_cache");
        } catch {}
        fetchSession();
      }
    },
    onScanAwarded: (payload) => {
      if (
        !payload ||
        payload.scannerId === participant?.id ||
        payload.scannedId === participant?.id
      ) {
        fetchSession();
      }
    },
  });

  const handleDraftHero = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/character/draft", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setParticipant(data.participant);
        setCharacter(data.character);
        setEditName(data.participant.display_name);
        setEditPowers(data.participant.powers);
      } else {
        setError(data.error || "Failed to summon character.");
      }
    } catch {
      setError("Network error while generating character.");
    } finally {
      setLoading(false);
    }
  };

  const handleRerollHero = async () => {
    setRerolling(true);
    setRerollMessage(null);
    try {
      const res = await fetch("/api/character/reroll", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setParticipant(data.participant);
        setCharacter(data.character);
        setEditName(data.participant.display_name);
        setEditPowers(data.participant.powers);
        setRerollMessage("New Superhero assigned and locked!");
      } else {
        setRerollMessage(data.error || "Re-roll failed.");
      }
    } catch {
      setRerollMessage("Network error during re-roll.");
    } finally {
      setRerolling(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/card/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: editName,
          powers: editPowers,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setParticipant(data.participant);
        setIsEditing(false);
      } else {
        setError(data.error || "Failed to update profile.");
      }
    } catch {
      setError("Network error while saving card.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full border-4 border-brand-yellow border-t-transparent animate-spin mb-4" />
        <div className="font-comic text-2xl text-brand-yellow tracking-wider uppercase">
          CALIBRATING SUPERHERO CARD...
        </div>
      </div>
    );
  }

  if (!participant) return null;

  // FIRST-TIME USER: No superhero assigned yet
  if (!participant.character_id || !character) {
    return (
      <div className="w-full max-w-md md:max-w-lg mx-auto border-x border-[#2C2C2C] shadow-2xl min-h-screen flex flex-col p-6 items-center justify-center text-center bg-halftone pb-24">
        <div className="w-24 h-24 rounded-full bg-brand-yellow/20 border-2 border-brand-yellow flex items-center justify-center shadow-[0_0_35px_#F3F000] mb-6 animate-pulse">
          <Sparkles className="w-12 h-12 text-brand-yellow" />
        </div>

        <div className="px-3 py-1 bg-brand-yellow text-black font-comic text-sm uppercase tracking-widest comic-tag border border-black mb-3">
          <span className="comic-tag-inner font-bold">IDENTITY PROTOCOL READY</span>
        </div>

        <h1 className="font-comic text-4xl md:text-5xl text-white uppercase mb-2 tracking-tight">
          SUMMON YOUR HERO
        </h1>
        <p className="text-sm text-brand-muted max-w-xs mb-8 leading-relaxed">
          Welcome, <span className="text-white font-bold">{participant.display_name}</span>! Connect with the multiverse and claim your randomized comic hero.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-950 border border-brand-red text-red-200 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-brand-red flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleDraftHero}
          type="button"
          className="w-full max-w-xs py-4 bg-brand-yellow hover:bg-[#ffe600] active:scale-95 text-black font-comic text-2xl uppercase tracking-wider rounded-xl shadow-comic-black border-2 border-black transition-all flex items-center justify-center gap-2"
        >
          <Zap className="w-6 h-6 fill-black" /> ROLL SUPERHERO
        </button>

        <Navigation />
      </div>
    );
  }

  const tier = getTierForLevel(participant.level);
  const currentLevelXp = getXpInCurrentLevel(participant.xp);
  const progressPercent = getXpProgressPercent(participant.xp);

  return (
    <div className="w-full max-w-md md:max-w-lg mx-auto border-x border-[#2C2C2C] shadow-2xl min-h-screen flex flex-col p-4 bg-[#121212] bg-halftone pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        {isOfflineMode ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/60 border border-amber-500/40 rounded-lg text-[11px] font-mono text-amber-300">
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span>Stored Offline Card (Ready to Scan)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" />
            <span className="text-xs font-mono tracking-widest text-brand-muted uppercase">
              LIVE CARD ACTIVE
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Link
            href="/leaderboard"
            className="flex items-center gap-1 text-xs font-bold text-brand-yellow hover:underline"
          >
            <Trophy className="w-3.5 h-3.5" /> Rank
          </Link>
        </div>
      </div>

      {/* Main Character Card Container */}
      <div className={`relative bg-[#181818] rounded-2xl border-4 ${tier.borderClass} p-4 shadow-2xl overflow-hidden mb-4 transition-all`}>
        {/* Tier Header Banner */}
        <div className="flex items-center justify-between mb-2">
          <div className="inline-block px-3 py-0.5 bg-black border border-brand-border rounded text-[11px] font-black tracking-widest uppercase text-brand-yellow">
            {tier.badge}
          </div>
          <div className="text-right">
            <span className="text-[11px] font-mono text-brand-muted">TOTAL XP:</span>{" "}
            <span className="font-mono font-bold text-brand-yellow text-sm">
              {participant.xp}
            </span>
          </div>
        </div>

        {/* Hero Artwork Frame */}
        <div className="relative rounded-xl border-2 border-black overflow-hidden shadow-inner mb-3">
          <HeroArtwork heroId={character.id} className="w-full h-48 md:h-52" />
          <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-black/80 backdrop-blur-md border border-white/20 rounded text-[10px] font-mono tracking-wider text-white">
            {character.universe}
          </div>
          <div className="absolute bottom-2 right-2 px-2.5 py-0.5 bg-brand-yellow text-black font-comic text-xs tracking-wider uppercase border border-black shadow-comic-sm">
            LVL {participant.level}
          </div>
        </div>

        {/* Hero Identity & Editable Details */}
        <div className="bg-[#121212] border-2 border-[#282828] p-3 rounded-xl mb-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-brand-muted">
                CODENAME
              </div>
              <h2 className="font-comic text-3xl text-brand-yellow leading-none tracking-wide">
                {character.heroTitle}
              </h2>
              <div className="text-sm font-bold text-white mt-0.5">
                {participant.display_name}
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              type="button"
              className="p-1.5 bg-[#1E1E1E] hover:bg-brand-yellow/20 border border-[#3A3A3A] rounded-lg text-brand-yellow transition-all"
              title="Edit Card Info"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* Superpowers */}
          <div className="mt-2 pt-2 border-t border-[#222222]">
            <div className="text-[10px] font-mono uppercase tracking-widest text-brand-muted mb-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-brand-yellow" /> EQUIPPED POWERS
            </div>
            <p className="text-xs text-[#d1d5db] font-sans leading-relaxed">
              {participant.powers || character.defaultPowers}
            </p>
          </div>
        </div>

        {/* Level & XP Progress Bar */}
        <div className="bg-[#121212] border border-[#282828] p-3 rounded-xl mb-3">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-white flex items-center gap-1">
              <span className="text-brand-yellow">LEVEL {participant.level}</span> PROGRESS
            </span>
            <span className="font-mono text-brand-muted text-[11px]">
              {currentLevelXp} / 50 XP ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-3 bg-[#202020] rounded-full overflow-hidden border border-[#333333] p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-brand-yellow to-yellow-300 rounded-full transition-all duration-500 shadow-[0_0_10px_#F3F000]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[10px] font-mono text-[#888888] mt-1.5 flex items-center justify-between">
            <span>Next Level at {50 - currentLevelXp} XP</span>
            <span className="text-brand-yellow font-bold">+10 XP per scan</span>
          </div>
        </div>

        {/* 1-Time Re-roll Option if unused */}
        {participant.reroll_count < 1 && (
          <div className="mb-3 p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-center justify-between">
            <div className="text-xs text-amber-200">
              <div className="font-bold flex items-center gap-1 text-[11px]">
                <Dices className="w-3.5 h-3.5 text-amber-400" /> 1 Character Re-Roll Available
              </div>
              <div className="text-[10px] text-amber-300/80">Want a different hero? Lock it in before event starts.</div>
            </div>
            <button
              onClick={handleRerollHero}
              disabled={rerolling}
              type="button"
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-bold text-xs rounded-lg transition-all"
            >
              {rerolling ? "Rolling..." : "Re-roll"}
            </button>
          </div>
        )}

        {rerollMessage && (
          <div className="mb-3 p-2 text-center text-xs bg-[#1E1E1E] text-brand-yellow rounded border border-brand-yellow/30 font-mono">
            {rerollMessage}
          </div>
        )}

        {/* Persistent QR Code & Fallback Manual Code */}
        <QRCodeDisplay
          qrToken={participant.qr_token}
          manualCode={participant.manual_code}
          displayName={participant.display_name}
        />
      </div>

      {/* Action to scan others */}
      <Link
        href="/scan"
        className="w-full py-3.5 bg-brand-yellow hover:bg-[#ffe600] active:scale-95 text-black font-comic text-xl uppercase tracking-wider rounded-xl shadow-comic-black border-2 border-black transition-all flex items-center justify-center gap-2 mb-4"
      >
        <QrCode className="w-5 h-5" /> SCAN OTHER PLAYERS (+10 XP)
      </Link>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#181818] border-2 border-brand-yellow p-5 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-comic text-2xl text-brand-yellow uppercase tracking-wide">
                EDIT HERO CARD
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-sm text-brand-muted hover:text-white"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={32}
                  required
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333333] focus:border-brand-yellow focus:outline-none rounded-lg text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Superpower Description
                </label>
                <textarea
                  value={editPowers}
                  onChange={(e) => setEditPowers(e.target.value)}
                  maxLength={160}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333333] focus:border-brand-yellow focus:outline-none rounded-lg text-xs text-white"
                />
                <span className="text-[10px] text-brand-muted block text-right mt-0.5">
                  {editPowers.length}/160 chars
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 bg-[#2A2A2A] hover:bg-[#333333] text-white text-xs font-bold uppercase rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-brand-yellow hover:bg-[#ffe600] text-black font-bold text-xs uppercase rounded-lg shadow-comic-sm"
                >
                  {saving ? "Saving..." : "Save Card"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Navigation />
    </div>
  );
}
