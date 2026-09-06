import { LevelTier } from "./types";

export const XP_PER_LEVEL = 50;

export const LEVEL_TIERS: LevelTier[] = [
  {
    tierName: "RECRUIT",
    minLevel: 1,
    badge: "LVL 1-2 RECRUIT",
    color: "#c8c6c5",
    borderClass: "border-brand-border",
  },
  {
    tierName: "HERO",
    minLevel: 3,
    badge: "LVL 3-4 HERO",
    color: "#00E5FF",
    borderClass: "border-cyan-400",
  },
  {
    tierName: "AVENGER",
    minLevel: 5,
    badge: "LVL 5-6 AVENGER",
    color: "#F3F000",
    borderClass: "border-brand-yellow shadow-comic-yellow",
  },
  {
    tierName: "COSMIC TITAN",
    minLevel: 7,
    badge: "LVL 7+ COSMIC TITAN",
    color: "#E62429",
    borderClass: "border-brand-red shadow-comic-red animate-pulse",
  },
];

export function getLevelFromXp(xp: number): number {
  return 1 + Math.floor(Math.max(0, xp) / XP_PER_LEVEL);
}

export function getXpInCurrentLevel(xp: number): number {
  return Math.max(0, xp) % XP_PER_LEVEL;
}

export function getXpProgressPercent(xp: number): number {
  return Math.min(100, Math.round(((Math.max(0, xp) % XP_PER_LEVEL) / XP_PER_LEVEL) * 100));
}

export function getTierForLevel(level: number): LevelTier {
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (level >= LEVEL_TIERS[i].minLevel) {
      return LEVEL_TIERS[i];
    }
  }
  return LEVEL_TIERS[0];
}
