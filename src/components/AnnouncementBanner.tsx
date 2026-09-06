"use client";

import React, { useState, useEffect } from "react";
import { useEventSync } from "@/hooks/useEventSync";
import { Announcement } from "@/lib/types";
import { AlertTriangle, Megaphone, Bell, X, ChevronUp, ChevronDown } from "lucide-react";

export function AnnouncementBanner() {
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Sync announcements in real-time
  useEventSync({
    onAnnouncement: (ann) => {
      setActiveAnnouncement(ann);
      if (ann) {
        setIsDismissed(false);
      }
    },
  });

  if (!activeAnnouncement || isDismissed) {
    return null;
  }

  const severityConfig = {
    urgent: {
      bg: "bg-[#2A0808]/95",
      border: "border-brand-red",
      badgeBg: "bg-brand-red text-white",
      text: "text-red-100",
      icon: <AlertTriangle className="w-4 h-4 text-brand-red animate-bounce" />,
      tag: "CRITICAL ALERT",
      glow: "shadow-[0_0_20px_rgba(230,36,41,0.35)]",
    },
    event: {
      bg: "bg-[#242004]/95",
      border: "border-brand-yellow",
      badgeBg: "bg-brand-yellow text-black",
      text: "text-yellow-100",
      icon: <Megaphone className="w-4 h-4 text-brand-yellow animate-pulse" />,
      tag: "ORGANIZER BROADCAST",
      glow: "shadow-[0_0_20px_rgba(243,240,0,0.3)]",
    },
    info: {
      bg: "bg-[#081C26]/95",
      border: "border-cyan-400",
      badgeBg: "bg-cyan-400 text-black",
      text: "text-cyan-100",
      icon: <Bell className="w-4 h-4 text-cyan-400" />,
      tag: "EVENT NOTICE",
      glow: "shadow-[0_0_20px_rgba(34,211,238,0.25)]",
    },
  }[activeAnnouncement.severity || "event"];

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] backdrop-blur-md border-b-2 ${severityConfig.border} ${severityConfig.bg} ${severityConfig.glow} transition-all duration-300 animate-slide-down`}
    >
      <div className="max-w-4xl mx-auto px-3 py-2 sm:py-2.5 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 flex items-center justify-center p-1.5 rounded-lg bg-black/40 border border-white/10">
            {severityConfig.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-widest font-mono ${severityConfig.badgeBg}`}
              >
                {severityConfig.tag}
              </span>
              <span className="text-[10px] font-mono text-brand-muted hidden sm:inline">
                {new Date(activeAnnouncement.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {!isMinimized && (
              <p
                className={`text-xs sm:text-sm font-comic tracking-wide leading-tight line-clamp-2 ${severityConfig.text}`}
              >
                {activeAnnouncement.message}
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            type="button"
            className="p-1 hover:bg-white/10 rounded text-brand-muted hover:text-white transition-colors"
            title={isMinimized ? "Expand announcement" : "Minimize announcement"}
          >
            {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            type="button"
            className="p-1 hover:bg-white/10 rounded text-brand-muted hover:text-white transition-colors"
            title="Dismiss from view"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
