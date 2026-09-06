import fs from "fs";
import path from "path";
import { Participant, ScanEvent, EventConfig, ClashTactic, ClashResult } from "./types";
import { getLevelFromXp } from "./progression";
import { getCharacterById } from "./characters";
import { createClient } from "@supabase/supabase-js";

// Optional Supabase client if credentials exist in env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes("placeholder"));

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

// Local JSON File DB Setup
const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

interface LocalDB {
  participants: Participant[];
  scanEvents: ScanEvent[];
  config: EventConfig;
}

// Initial seed data so the system is immediately testable
const INITIAL_SEED_PARTICIPANTS: Participant[] = [
  {
    id: "part_1",
    phone_number: "9876543210",
    display_name: "Tony S.",
    powers: "Genius Intellect, Micro-Drones & Arc Tech",
    character_id: "iron-man",
    reroll_count: 0,
    xp: 60,
    level: 2,
    qr_token: "qr_tok_9876543210_ironman",
    manual_code: "SHK-IRON",
    created_at: new Date().toISOString(),
    last_scan_at: new Date().toISOString(),
  },
  {
    id: "part_2",
    phone_number: "9123456780",
    display_name: "Thor O.",
    powers: "Thunder Calling, Lightning Shield & Storm Flight",
    character_id: "thor",
    reroll_count: 0,
    xp: 120,
    level: 3,
    qr_token: "qr_tok_9123456780_thor",
    manual_code: "SHK-THOR",
    created_at: new Date().toISOString(),
    last_scan_at: new Date().toISOString(),
  },
  {
    id: "part_3",
    phone_number: "9988776655",
    display_name: "Bruce B.",
    powers: "Limitless Kinetic Might & Shockwaves",
    character_id: "hulk",
    reroll_count: 0,
    xp: 40,
    level: 1,
    qr_token: "qr_tok_9988776655_hulk",
    manual_code: "SHK-HULK",
    created_at: new Date().toISOString(),
    last_scan_at: new Date().toISOString(),
  },
  {
    id: "part_4",
    phone_number: "9000011111",
    display_name: "Peter P.",
    powers: "Acrobatic Web Traversal & Danger Sense",
    character_id: "spiderman",
    reroll_count: 0,
    xp: 180,
    level: 4,
    qr_token: "qr_tok_9000011111_spidey",
    manual_code: "SHK-SPDR",
    created_at: new Date().toISOString(),
    last_scan_at: new Date().toISOString(),
  },
  {
    id: "part_5",
    phone_number: "9555544444",
    display_name: "T'Challa",
    powers: "Vibranium Kinetic Claws & Panther Agility",
    character_id: "black-panther",
    reroll_count: 0,
    xp: 260,
    level: 6,
    qr_token: "qr_tok_9555544444_panther",
    manual_code: "SHK-PNTH",
    created_at: new Date().toISOString(),
    last_scan_at: new Date().toISOString(),
  },
  {
    id: "part_6",
    phone_number: "9777788888",
    display_name: "Carol D.",
    powers: "Photon Beams & Lightspeed Flight",
    character_id: "captain-marvel",
    reroll_count: 0,
    xp: 10,
    level: 1,
    qr_token: "qr_tok_9777788888_marvel",
    manual_code: "SHK-MRVL",
    created_at: new Date().toISOString(),
    last_scan_at: new Date().toISOString(),
  },
  {
    id: "part_7",
    phone_number: "9222233333",
    display_name: "New Recruit",
    powers: "Super Speed & Reflexes",
    character_id: null,
    reroll_count: 0,
    xp: 0,
    level: 1,
    qr_token: "qr_tok_9222233333_recruit",
    manual_code: "SHK-RC01",
    created_at: new Date().toISOString(),
    last_scan_at: null,
  },
];

// In-Memory Fast Cache Singleton for handling 200+ concurrent users with zero disk latency
let memoryDb: LocalDB | null = null;
let scanPairSet = new Set<string>();

function getMemoryDb(): LocalDB {
  if (memoryDb) return memoryDb;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, "utf8");
      memoryDb = JSON.parse(data);
    } catch {
      memoryDb = null;
    }
  }

  if (!memoryDb) {
    memoryDb = {
      participants: [...INITIAL_SEED_PARTICIPANTS],
      scanEvents: [],
      config: {
        is_event_active: true,
        is_leaderboard_public: false,
        admin_password_hash: process.env.ADMIN_PASSWORD || "",
        active_announcement: null,
      },
    };
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), "utf8");
    } catch {}
  }

  // Populate fast scan check set
  scanPairSet = new Set(
    memoryDb.scanEvents.map((s) => `${s.scanner_id}:${s.scanned_id}`)
  );

  return memoryDb;
}

let saveTimeout: NodeJS.Timeout | null = null;
function persistLocalDbAsync() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    if (!memoryDb) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), "utf8");
    } catch (err) {
      console.error("Async DB write error:", err);
    }
  }, 25);
}

export function generateQrToken(phone: string): string {
  const rand = Math.random().toString(36).substring(2, 10);
  return `shk_${phone.slice(-4)}_${rand}_${Date.now()}`;
}

export function generateManualCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SHK-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Database helper operations (Optimized with in-memory O(1) indices for burst traffic)
export async function getParticipantByPhone(phone: string): Promise<Participant | null> {
  const cleanPhone = phone.trim();
  if (supabase) {
    const { data } = await supabase
      .from("participants")
      .select("*")
      .eq("phone_number", cleanPhone)
      .maybeSingle();
    return data || null;
  }
  const db = getMemoryDb();
  return db.participants.find((p) => p.phone_number === cleanPhone) || null;
}

export async function getParticipantById(id: string): Promise<Participant | null> {
  if (supabase) {
    const { data } = await supabase
      .from("participants")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data || null;
  }
  const db = getMemoryDb();
  return db.participants.find((p) => p.id === id) || null;
}

export async function getParticipantByQrToken(qrToken: string): Promise<Participant | null> {
  const cleanToken = qrToken.trim();
  if (supabase) {
    const { data } = await supabase
      .from("participants")
      .select("*")
      .eq("qr_token", cleanToken)
      .maybeSingle();
    return data || null;
  }
  const db = getMemoryDb();
  return db.participants.find((p) => p.qr_token === cleanToken) || null;
}

export async function getParticipantByManualCode(code: string): Promise<Participant | null> {
  const cleanCode = code.trim().toUpperCase();
  if (supabase) {
    const { data } = await supabase
      .from("participants")
      .select("*")
      .eq("manual_code", cleanCode)
      .maybeSingle();
    return data || null;
  }
  const db = getMemoryDb();
  return db.participants.find((p) => p.manual_code.toUpperCase() === cleanCode) || null;
}

export async function createParticipant(data: Partial<Participant> & { phone_number: string }): Promise<Participant> {
  const newParticipant: Participant = {
    id: data.id || `part_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    phone_number: data.phone_number.trim(),
    display_name: data.display_name?.trim() || `Agent ${data.phone_number.slice(-4)}`,
    powers: data.powers || "Adaptive Reflexes, Energy Burst",
    character_id: data.character_id || null,
    reroll_count: data.reroll_count || 0,
    xp: data.xp || 0,
    level: data.level || 1,
    qr_token: data.qr_token || generateQrToken(data.phone_number),
    manual_code: data.manual_code || generateManualCode(),
    created_at: new Date().toISOString(),
    last_scan_at: null,
  };

  if (supabase) {
    const { data: inserted, error } = await supabase
      .from("participants")
      .insert(newParticipant)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return inserted;
  }

  const db = getMemoryDb();
  db.participants.push(newParticipant);
  persistLocalDbAsync();
  return newParticipant;
}

export async function updateParticipant(id: string, updates: Partial<Participant>): Promise<Participant | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from("participants")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const db = getMemoryDb();
  const index = db.participants.findIndex((p) => p.id === id);
  if (index === -1) return null;

  db.participants[index] = { ...db.participants[index], ...updates };
  persistLocalDbAsync();
  return db.participants[index];
}

export async function getAllParticipants(): Promise<Participant[]> {
  if (supabase) {
    const { data } = await supabase
      .from("participants")
      .select("*")
      .order("xp", { ascending: false });
    return data || [];
  }
  const db = getMemoryDb();
  return [...db.participants].sort((a, b) => b.xp - a.xp);
}

export async function importParticipantsBatch(phoneList: { phone: string; name?: string }[]): Promise<{ added: number; skipped: number }> {
  let added = 0;
  let skipped = 0;

  for (const item of phoneList) {
    const cleanPhone = item.phone.trim();
    if (!cleanPhone || cleanPhone.length < 5) {
      skipped++;
      continue;
    }
    const existing = await getParticipantByPhone(cleanPhone);
    if (existing) {
      skipped++;
      continue;
    }
    await createParticipant({
      phone_number: cleanPhone,
      display_name: item.name?.trim() || `Agent ${cleanPhone.slice(-4)}`,
    });
    added++;
  }

  return { added, skipped };
}

export async function recordScanEvent(
  scannerId: string,
  scannedId: string,
  tacticChoice?: ClashTactic
): Promise<{
  success: boolean;
  error?: string;
  scanner?: Participant;
  scanned?: Participant;
  xpAwarded?: number;
  newLevel?: number;
  leveledUp?: boolean;
  clashResult?: ClashResult;
}> {
  const config = await getEventConfig();
  if (!config.is_event_active) {
    return { success: false, error: "Event scanning is currently paused by organizers." };
  }

  if (scannerId === scannedId) {
    return { success: false, error: "Self-scan blocked: You cannot scan your own QR code!" };
  }

  const scanner = await getParticipantById(scannerId);
  const scanned = await getParticipantById(scannedId);

  if (!scanner || !scanned) {
    return { success: false, error: "Participant not found." };
  }

  const scannerHero = getCharacterById(scanner.character_id);
  const scannedHero = getCharacterById(scanned.character_id);

  // Determine opponent defense tactic based on hero combat profile
  const tactics: ClashTactic[] = ["STRIKE", "SHIELD", "BLITZ"];
  let opponentTactic: ClashTactic = "STRIKE";
  const roll = Math.random();
  if (scannedHero.combatClass === "MIGHT") {
    opponentTactic = roll < 0.6 ? "STRIKE" : roll < 0.8 ? "SHIELD" : "BLITZ";
  } else if (scannedHero.combatClass === "TECH") {
    opponentTactic = roll < 0.6 ? "SHIELD" : roll < 0.8 ? "BLITZ" : "STRIKE";
  } else {
    opponentTactic = roll < 0.6 ? "BLITZ" : roll < 0.8 ? "STRIKE" : "SHIELD";
  }

  const playerTactic: ClashTactic = tacticChoice || tactics[Math.floor(Math.random() * tactics.length)];

  // Resolve clash: STRIKE beats SHIELD, SHIELD beats BLITZ, BLITZ beats STRIKE
  let outcome: "VICTORY" | "DRAW" | "DEFEAT" = "DRAW";
  if (playerTactic === opponentTactic) {
    outcome = "DRAW";
  } else if (
    (playerTactic === "STRIKE" && opponentTactic === "SHIELD") ||
    (playerTactic === "SHIELD" && opponentTactic === "BLITZ") ||
    (playerTactic === "BLITZ" && opponentTactic === "STRIKE")
  ) {
    outcome = "VICTORY";
  } else {
    outcome = "DEFEAT";
  }

  const xpAwarded = outcome === "VICTORY" ? 15 : 10;
  const bonusXp = outcome === "VICTORY" ? 5 : 0;

  const clashResult: ClashResult = {
    scannerTactic: playerTactic,
    opponentTactic,
    outcome,
    bonusXp,
    totalXpAwarded: xpAwarded,
    scannerHero: scannerHero.heroTitle,
    opponentHero: scannedHero.heroTitle,
    specialMove: scannerHero.specialMove,
    impactPhrase:
      outcome === "VICTORY"
        ? `CRITICAL CLASH! ${scannerHero.specialMove} breached ${scannedHero.heroTitle}'s guard! +15 XP!`
        : outcome === "DRAW"
        ? `ENERGY DEFLECTION! Both titans clashed evenly. Standard +10 XP awarded.`
        : `DEFENSIVE PARRY! ${scannedHero.heroTitle} defended the surge. Standard +10 XP awarded.`,
  };

  // Atomic check for duplicate scan pair
  if (supabase) {
    const scanEventId = `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const { error: insertError } = await supabase.from("scan_events").insert({
      id: scanEventId,
      scanner_id: scannerId,
      scanned_id: scannedId,
      xp_awarded: xpAwarded,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      if (insertError.code === "23505" || insertError.message.includes("unique")) {
        return { success: false, error: `You have already scanned ${scanned.display_name}'s QR code!` };
      }
      return { success: false, error: insertError.message };
    }

    const previousLevel = scanner.level;
    const newXp = scanner.xp + xpAwarded;
    const newLevel = getLevelFromXp(newXp);
    const leveledUp = newLevel > previousLevel;

    const updatedScanner = await updateParticipant(scannerId, {
      xp: newXp,
      level: newLevel,
      last_scan_at: new Date().toISOString(),
    });

    return {
      success: true,
      scanner: updatedScanner || scanner,
      scanned,
      xpAwarded,
      newLevel,
      leveledUp,
      clashResult,
    };
  }

  // Fast Memory DB atomic check
  const pairKey = `${scannerId}:${scannedId}`;
  if (scanPairSet.has(pairKey)) {
    return {
      success: false,
      error: `You have already scanned ${scanned.display_name}'s card! Repeat scans do not award XP.`,
    };
  }

  scanPairSet.add(pairKey);

  const db = getMemoryDb();
  const newScanEvent: ScanEvent = {
    id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    scanner_id: scannerId,
    scanned_id: scannedId,
    xp_awarded: xpAwarded,
    created_at: new Date().toISOString(),
    clash_outcome: outcome,
  };

  const previousLevel = scanner.level;
  const newXp = scanner.xp + xpAwarded;
  const newLevel = getLevelFromXp(newXp);
  const leveledUp = newLevel > previousLevel;

  db.scanEvents.push(newScanEvent);
  const scannerIndex = db.participants.findIndex((p) => p.id === scannerId);
  if (scannerIndex !== -1) {
    db.participants[scannerIndex].xp = newXp;
    db.participants[scannerIndex].level = newLevel;
    db.participants[scannerIndex].last_scan_at = new Date().toISOString();
  }
  persistLocalDbAsync();

  return {
    success: true,
    scanner: db.participants[scannerIndex],
    scanned,
    xpAwarded,
    newLevel,
    leveledUp,
    clashResult,
  };
}

export async function hasAlreadyScanned(scannerId: string, scannedId: string): Promise<boolean> {
  if (scannerId === scannedId) return true;
  if (supabase) {
    const { data } = await supabase
      .from("scan_events")
      .select("id")
      .eq("scanner_id", scannerId)
      .eq("scanned_id", scannedId)
      .maybeSingle();
    return Boolean(data);
  }
  const pairKey = `${scannerId}:${scannedId}`;
  return scanPairSet.has(pairKey);
}

export async function recordDuelScanEvent(
  scannerId: string,
  scannedId: string,
  scannerTactic: ClashTactic,
  scannedTactic: ClashTactic
): Promise<{
  success: boolean;
  error?: string;
  scanner?: Participant;
  scanned?: Participant;
  scannerResult?: ClashResult;
  scannedResult?: ClashResult;
  newLevelScanner?: number;
  newLevelScanned?: number;
}> {
  const config = await getEventConfig();
  if (!config.is_event_active) {
    return { success: false, error: "Event scanning is currently paused by organizers." };
  }

  if (scannerId === scannedId) {
    return { success: false, error: "Self-scan blocked: You cannot duel yourself!" };
  }

  const scanner = await getParticipantById(scannerId);
  const scanned = await getParticipantById(scannedId);

  if (!scanner || !scanned) {
    return { success: false, error: "Participant not found." };
  }

  const scannerHero = getCharacterById(scanner.character_id);
  const scannedHero = getCharacterById(scanned.character_id);

  // Determine outcome
  let scannerOutcome: "VICTORY" | "DRAW" | "DEFEAT" = "DRAW";
  let scannedOutcome: "VICTORY" | "DRAW" | "DEFEAT" = "DRAW";

  if (scannerTactic === scannedTactic) {
    scannerOutcome = "DRAW";
    scannedOutcome = "DRAW";
  } else if (
    (scannerTactic === "STRIKE" && scannedTactic === "SHIELD") ||
    (scannerTactic === "SHIELD" && scannedTactic === "BLITZ") ||
    (scannerTactic === "BLITZ" && scannedTactic === "STRIKE")
  ) {
    scannerOutcome = "VICTORY";
    scannedOutcome = "DEFEAT";
  } else {
    scannerOutcome = "DEFEAT";
    scannedOutcome = "VICTORY";
  }

  const scannerXp = scannerOutcome === "VICTORY" ? 15 : 10;
  const scannedXp = scannedOutcome === "VICTORY" ? 15 : 10;

  const scannerResult: ClashResult = {
    scannerTactic,
    opponentTactic: scannedTactic,
    outcome: scannerOutcome,
    bonusXp: scannerOutcome === "VICTORY" ? 5 : 0,
    totalXpAwarded: scannerXp,
    scannerHero: scannerHero.heroTitle,
    opponentHero: scannedHero.heroTitle,
    specialMove: scannerHero.specialMove,
    impactPhrase:
      scannerOutcome === "VICTORY"
        ? `CRITICAL CLASH! ${scannerHero.specialMove} breached ${scannedHero.heroTitle}'s guard! +15 XP!`
        : scannerOutcome === "DRAW"
        ? `ENERGY DEFLECTION! Both titans clashed evenly. +10 XP awarded.`
        : `DEFENSIVE PARRY! ${scannedHero.heroTitle} defended the surge. +10 XP awarded.`,
  };

  const scannedResult: ClashResult = {
    scannerTactic: scannedTactic,
    opponentTactic: scannerTactic,
    outcome: scannedOutcome,
    bonusXp: scannedOutcome === "VICTORY" ? 5 : 0,
    totalXpAwarded: scannedXp,
    scannerHero: scannedHero.heroTitle,
    opponentHero: scannerHero.heroTitle,
    specialMove: scannedHero.specialMove,
    impactPhrase:
      scannedOutcome === "VICTORY"
        ? `TACTICAL COUNTER! ${scannedHero.specialMove} outmaneuvered ${scannerHero.heroTitle}! +15 XP!`
        : scannedOutcome === "DRAW"
        ? `ENERGY DEFLECTION! Both titans clashed evenly. +10 XP awarded.`
        : `GUARD BREACHED! ${scannerHero.heroTitle} landed a powerful strike. +10 XP awarded.`,
  };

  if (supabase) {
    const scanEventId = `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const { error: insertError } = await supabase.from("scan_events").insert({
      id: scanEventId,
      scanner_id: scannerId,
      scanned_id: scannedId,
      xp_awarded: scannerXp,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      if (insertError.code === "23505" || insertError.message.includes("unique")) {
        return { success: false, error: `You have already scanned ${scanned.display_name}'s QR code!` };
      }
      return { success: false, error: insertError.message };
    }

    const newXpScanner = scanner.xp + scannerXp;
    const newLevelScanner = getLevelFromXp(newXpScanner);
    const updatedScanner = await updateParticipant(scannerId, {
      xp: newXpScanner,
      level: newLevelScanner,
      last_scan_at: new Date().toISOString(),
    });

    const newXpScanned = scanned.xp + scannedXp;
    const newLevelScanned = getLevelFromXp(newXpScanned);
    const updatedScanned = await updateParticipant(scannedId, {
      xp: newXpScanned,
      level: newLevelScanned,
      last_scan_at: new Date().toISOString(),
    });

    return {
      success: true,
      scanner: updatedScanner || scanner,
      scanned: updatedScanned || scanned,
      scannerResult,
      scannedResult,
      newLevelScanner,
      newLevelScanned,
    };
  }

  const pairKey = `${scannerId}:${scannedId}`;
  if (scanPairSet.has(pairKey)) {
    return {
      success: false,
      error: `You have already scanned ${scanned.display_name}'s card! Repeat scans do not award XP.`,
    };
  }
  scanPairSet.add(pairKey);

  const db = getMemoryDb();
  const newScanEvent: ScanEvent = {
    id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    scanner_id: scannerId,
    scanned_id: scannedId,
    xp_awarded: scannerXp,
    created_at: new Date().toISOString(),
    clash_outcome: scannerOutcome,
  };
  db.scanEvents.push(newScanEvent);

  const newXpScanner = scanner.xp + scannerXp;
  const newLevelScanner = getLevelFromXp(newXpScanner);
  const scannerIndex = db.participants.findIndex((p) => p.id === scannerId);
  if (scannerIndex !== -1) {
    db.participants[scannerIndex].xp = newXpScanner;
    db.participants[scannerIndex].level = newLevelScanner;
    db.participants[scannerIndex].last_scan_at = new Date().toISOString();
  }

  const newXpScanned = scanned.xp + scannedXp;
  const newLevelScanned = getLevelFromXp(newXpScanned);
  const scannedIndex = db.participants.findIndex((p) => p.id === scannedId);
  if (scannedIndex !== -1) {
    db.participants[scannedIndex].xp = newXpScanned;
    db.participants[scannedIndex].level = newLevelScanned;
    db.participants[scannedIndex].last_scan_at = new Date().toISOString();
  }
  persistLocalDbAsync();

  return {
    success: true,
    scanner: db.participants[scannerIndex],
    scanned: db.participants[scannedIndex],
    scannerResult,
    scannedResult,
    newLevelScanner,
    newLevelScanned,
  };
}

export async function getEventConfig(): Promise<EventConfig> {
  if (supabase) {
    const { data } = await supabase
      .from("event_config")
      .select("*")
      .eq("id", "config_main")
      .maybeSingle();
    if (data) return data;
  }
  const db = getMemoryDb();
  return db.config;
}

export async function updateEventConfig(updates: Partial<EventConfig>): Promise<EventConfig> {
  if (supabase) {
    const { data, error } = await supabase
      .from("event_config")
      .update(updates)
      .eq("id", "config_main")
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
  const db = getMemoryDb();
  db.config = { ...db.config, ...updates };
  persistLocalDbAsync();
  return db.config;
}

export async function resetParticipantStats(id: string): Promise<boolean> {
  if (supabase) {
    await supabase.from("scan_events").delete().or(`scanner_id.eq.${id},scanned_id.eq.${id}`);
    await supabase.from("participants").update({ xp: 0, level: 1, reroll_count: 0, character_id: null }).eq("id", id);
    return true;
  }
  const db = getMemoryDb();
  db.scanEvents = db.scanEvents.filter((s) => s.scanner_id !== id && s.scanned_id !== id);
  scanPairSet = new Set(
    db.scanEvents.map((s) => `${s.scanner_id}:${s.scanned_id}`)
  );
  const index = db.participants.findIndex((p) => p.id === id);
  if (index !== -1) {
    db.participants[index].xp = 0;
    db.participants[index].level = 1;
    db.participants[index].reroll_count = 0;
    db.participants[index].character_id = null;
    db.participants[index].last_scan_at = null;
  }
  persistLocalDbAsync();
  return true;
}

export async function getScanStats(): Promise<{ totalParticipants: number; totalScans: number; activeScanners: number }> {
  if (supabase) {
    const [{ count: totalParticipants }, { count: totalScans }, { data: scannerData }] = await Promise.all([
      supabase.from("participants").select("*", { count: "exact", head: true }),
      supabase.from("scan_events").select("*", { count: "exact", head: true }),
      supabase.from("scan_events").select("scanner_id"),
    ]);

    const uniqueScanners = new Set((scannerData || []).map((s: any) => s.scanner_id));
    return {
      totalParticipants: totalParticipants || 0,
      totalScans: totalScans || 0,
      activeScanners: uniqueScanners.size,
    };
  }

  const db = getMemoryDb();
  const uniqueScanners = new Set(db.scanEvents.map((s) => s.scanner_id));
  return {
    totalParticipants: db.participants.length,
    totalScans: db.scanEvents.length,
    activeScanners: uniqueScanners.size,
  };
}
