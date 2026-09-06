export type AnnouncementSeverity = "info" | "urgent" | "event";

export interface Announcement {
  id: string;
  message: string;
  severity: AnnouncementSeverity;
  createdAt: string;
  expiresAt?: string;
}

export type ClashTactic = "STRIKE" | "SHIELD" | "BLITZ";

export interface ClashResult {
  scannerTactic: ClashTactic;
  opponentTactic: ClashTactic;
  outcome: "VICTORY" | "DRAW" | "DEFEAT";
  bonusXp: number;
  totalXpAwarded: number;
  scannerHero: string;
  opponentHero: string;
  specialMove: string;
  impactPhrase: string;
}

export interface Participant {
  id: string;
  phone_number: string;
  display_name: string;
  powers: string;
  character_id: string | null;
  reroll_count: number;
  xp: number;
  level: number;
  qr_token: string;
  manual_code: string;
  created_at: string;
  last_scan_at: string | null;
}

export interface ScanEvent {
  id: string;
  scanner_id: string;
  scanned_id: string;
  xp_awarded: number;
  created_at: string;
  clash_outcome?: "VICTORY" | "DRAW" | "DEFEAT";
}

export interface EventConfig {
  is_event_active: boolean;
  is_leaderboard_public: boolean;
  admin_password_hash: string;
  active_announcement?: Announcement | null;
}

export interface CharacterInfo {
  id: string;
  name: string;
  heroTitle: string;
  universe: string;
  defaultPowers: string;
  quote: string;
  accentColor: string;
  badgeBg: string;
  description: string;
  svgIcon: string;
  combatClass: "TECH" | "MIGHT" | "COSMIC" | "MARTIAL";
  specialMove: string;
}

export interface LevelTier {
  tierName: string;
  minLevel: number;
  badge: string;
  color: string;
  borderClass: string;
}

