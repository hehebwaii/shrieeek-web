"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, QrCode, Trophy, BookOpen, LogOut } from "lucide-react";

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Hide nav on login or admin pages
  if (pathname === "/" || pathname === "/login" || pathname.startsWith("/admin")) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      router.push("/");
    }
  };

  const navItems = [
    { label: "My Card", href: "/card", icon: User },
    { label: "Scan", href: "/scan", icon: QrCode },
    { label: "Codex", href: "/codex", icon: BookOpen },
    { label: "Ranks", href: "/leaderboard", icon: Trophy },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center bg-[#121212]/95 backdrop-blur-md border-t-2 border-[#2C2C2C] pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      <div className="w-full max-w-md md:max-w-lg flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? "text-brand-yellow font-bold scale-105"
                  : "text-brand-muted hover:text-white"
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-brand-yellow/20 border border-brand-yellow/40 shadow-[0_0_10px_rgba(243,240,0,0.2)]"
                    : "hover:bg-[#202020]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    isActive ? "text-brand-yellow" : "text-brand-muted"
                  }`}
                />
              </div>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-mono font-bold mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          type="button"
          title="Sign Out"
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-brand-muted hover:text-brand-red transition-all"
        >
          <div className="p-1.5 rounded-lg hover:bg-brand-red/15 hover:border hover:border-brand-red/30">
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-brand-muted hover:text-brand-red" />
          </div>
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-mono font-bold mt-0.5">
            Exit
          </span>
        </button>
      </div>
    </nav>
  );
};
