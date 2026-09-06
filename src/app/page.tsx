"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, ShieldCheck, ArrowRight, Lock, Phone, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper when user types phone: automatically populate first 5 digits if desired
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
    if (val.length >= 5) {
      setPassword(val.slice(0, 5));
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone) {
      setError("Please enter your registered phone number.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phone,
          password: password || phone.slice(0, 5),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed. Check your phone number.");
        setLoading(false);
        return;
      }

      router.push("/card");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  // Quick Demo Auto-Fill
  const handleQuickDemo = (demoPhone: string) => {
    setPhone(demoPhone);
    setPassword(demoPhone.slice(0, 5));
    setError(null);
  };

  return (
    <div className="w-full max-w-md md:max-w-lg mx-auto border-x border-[#2C2C2C] shadow-2xl flex flex-col flex-1 min-h-screen p-5 bg-[#121212] bg-halftone justify-between">
      {/* Top IEEE Event Branding */}
      <div className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-1 px-3 py-1 bg-brand-yellow text-black font-comic text-sm tracking-wider uppercase rounded-sm shadow-comic-black border border-black">
            <Zap className="w-3.5 h-3.5 fill-black" /> IEEE EVENT SYSTEM
          </div>
        </div>

        <h1 className="font-comic text-5xl md:text-6xl text-brand-yellow uppercase tracking-tight leading-none drop-shadow-[3px_3px_0px_#000000]">
          ShrIEEEk &apos;26
        </h1>
        <p className="text-sm text-brand-muted mt-2 leading-relaxed">
          Digital Superhero Character Card & Live In-Person QR Networking Grid.
        </p>
      </div>

      {/* Main Login Comic Card */}
      <div className="my-6 bg-[#181818] border-2 border-[#2C2C2C] p-6 rounded-2xl shadow-card-shadow relative">
        <div className="absolute -top-3 left-6 px-3 py-0.5 bg-brand-red text-white text-[11px] font-black uppercase tracking-widest comic-tag border border-black">
          <span className="comic-tag-inner flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> PARTICIPANT LOGIN
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/80 border border-brand-red rounded-lg flex items-start gap-2 text-xs text-red-200 animate-comic-pop">
            <AlertCircle className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-yellow" /> Mobile Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="e.g. 9876543210"
              maxLength={10}
              className="w-full px-4 py-3 bg-[#121212] border-2 border-[#333333] focus:border-brand-yellow focus:outline-none rounded-xl text-lg font-mono text-white placeholder:text-[#555555] transition-colors"
            />
            <span className="text-[11px] text-[#777777] mt-1 block">
              Enter the 10-digit number you registered with.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-brand-yellow" /> Passcode (First 5 Digits)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="First 5 characters"
              maxLength={5}
              className="w-full px-4 py-3 bg-[#121212] border-2 border-[#333333] focus:border-brand-yellow focus:outline-none rounded-xl text-lg font-mono text-white placeholder:text-[#555555] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-yellow hover:bg-[#ffe600] active:scale-95 text-black font-comic text-2xl uppercase tracking-wider rounded-xl shadow-comic-black border-2 border-black transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? "INITIALIZING CARD..." : "ACCESS CHARACTER CARD"}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        {/* Quick Demo Selector for instant pairing testing */}
        <div className="mt-6 pt-5 border-t border-[#282828]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-yellow" /> Quick Pre-Registered Demo Accounts:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("9876543210")}
              className="p-2 bg-[#121212] hover:border-brand-yellow border border-[#2D2D2D] rounded-lg text-left text-xs font-mono text-brand-white transition-all active:scale-95"
            >
              <span className="text-brand-yellow font-bold block">9876543210</span>
              <span className="text-[10px] text-brand-muted">Tony S. (Lvl 2)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("9123456780")}
              className="p-2 bg-[#121212] hover:border-brand-yellow border border-[#2D2D2D] rounded-lg text-left text-xs font-mono text-brand-white transition-all active:scale-95"
            >
              <span className="text-brand-yellow font-bold block">9123456780</span>
              <span className="text-[10px] text-brand-muted">Thor O. (Lvl 3)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("9000011111")}
              className="p-2 bg-[#121212] hover:border-brand-yellow border border-[#2D2D2D] rounded-lg text-left text-xs font-mono text-brand-white transition-all active:scale-95"
            >
              <span className="text-brand-yellow font-bold block">9000011111</span>
              <span className="text-[10px] text-brand-muted">Peter P. (Lvl 4)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("9222233333")}
              className="p-2 bg-[#121212] hover:border-brand-yellow border border-[#2D2D2D] rounded-lg text-left text-xs font-mono text-brand-white transition-all active:scale-95"
            >
              <span className="text-green-400 font-bold block">9222233333</span>
              <span className="text-[10px] text-brand-muted">New Hero (Roll)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-[11px] text-[#666666] font-mono pb-2">
        IEEE STUDENT BRANCH &bull; 2026 DIGITAL EXPERIENCE &bull; SECURE &amp; VERIFIED
      </div>
    </div>
  );
}
