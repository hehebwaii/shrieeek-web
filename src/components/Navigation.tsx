"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, QrCode, Trophy, ShieldAlert, LogOut } from "lucide-react";

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
    { label: "Card", href: "/card", icon: User },
    { label: "Scanner", href: "/scan", icon: QrCode },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center bg-[#121212]/95 backdrop-blur-md border-t-2 border-[#2C2C2C] pb-safe">
      <div className="w-full max-w-md md:max-w-lg flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all ${
                isActive
                  ? "text-brand-yellow font-bold scale-105"
                  : "text-brand-muted hover:text-white"
              }`}
            >
              <div className={`p-1 rounded-md ${isActive ? "bg-brand-yellow/15" : ""}`}>
                <Icon className={`w-5 h-5 ${isActive ? "text-brand-yellow" : "text-brand-muted"}`} />
              </div>
              <span className="text-[10px] uppercase tracking-wider font-semibold mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          type="button"
          title="Sign Out"
          className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-brand-muted hover:text-brand-red transition-all"
        >
          <div className="p-1 rounded-md hover:bg-brand-red/10">
            <LogOut className="w-5 h-5 text-brand-muted hover:text-brand-red" />
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold mt-0.5">
            Exit
          </span>
        </button>
      </div>
    </nav>
  );
};
