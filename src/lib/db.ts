import fs from "fs";
import path from "path";
import { Participant, ScanEvent, EventConfig, CodexEntry, CharacterInfo } from "./types";
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

// Initial seed data is empty for production roster import
const INITIAL_SEED_PARTICIPANTS: Participant[] = [];

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
  scannedId: string
): Promise<{
  success: boolean;
  error?: string;
  scanner?: Participant;
  scanned?: Participant;
  scannedHero?: CharacterInfo;
  xpAwarded?: number;
  newLevel?: number;
  leveledUp?: boolean;
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

  const scannedHero = getCharacterById(scanned.character_id);
  const xpAwarded = 15; // +15 XP per discovered hero

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
        return { success: false, error: `You have already discovered ${scanned.display_name}'s card!` };
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

    // Also award +5 XP to the scanned person for being discovered
    const scannedNewXp = scanned.xp + 5;
    const scannedNewLevel = getLevelFromXp(scannedNewXp);
    await updateParticipant(scannedId, {
      xp: scannedNewXp,
      level: scannedNewLevel,
      last_scan_at: new Date().toISOString(),
    });

    return {
      success: true,
      scanner: updatedScanner || scanner,
      scanned,
      scannedHero,
      xpAwarded,
      newLevel,
      leveledUp,
    };
  }

  // Fast Memory DB atomic check
  const pairKey = `${scannerId}:${scannedId}`;
  if (scanPairSet.has(pairKey)) {
    return {
      success: false,
      error: `You have already discovered ${scanned.display_name}'s card! Repeat scans do not award XP.`,
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

  const scannedIndex = db.participants.findIndex((p) => p.id === scannedId);
  if (scannedIndex !== -1) {
    db.participants[scannedIndex].xp = db.participants[scannedIndex].xp + 5;
    db.participants[scannedIndex].level = getLevelFromXp(db.participants[scannedIndex].xp);
    db.participants[scannedIndex].last_scan_at = new Date().toISOString();
  }
  persistLocalDbAsync();

  return {
    success: true,
    scanner: db.participants[scannerIndex],
    scanned,
    scannedHero,
    xpAwarded,
    newLevel,
    leveledUp,
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

export async function getParticipantCodex(
  scannerId: string
): Promise<{ codex: CodexEntry[]; totalHeroes: number }> {
  if (supabase) {
    // 1. Get all events where current user is scanner
    const { data: scans } = await supabase
      .from("scan_events")
      .select("scanned_id, created_at")
      .eq("scanner_id", scannerId)
      .order("created_at", { ascending: false });

    // 2. Get all events where current user is scanned (to check mutual allies)
    const { data: incomingScans } = await supabase
      .from("scan_events")
      .select("scanner_id")
      .eq("scanned_id", scannerId);

    const mutualSet = new Set((incomingScans || []).map((s) => s.scanner_id));

    // 3. Get total participants count
    const { count: totalHeroes } = await supabase
      .from("participants")
      .select("*", { count: "exact", head: true });

    if (!scans || scans.length === 0) {
      return { codex: [], totalHeroes: totalHeroes || 0 };
    }

    const scannedIds = Array.from(new Set(scans.map((s) => s.scanned_id)));
    const { data: participants } = await supabase
      .from("participants")
      .select("id, display_name, character_id, powers, level")
      .in("id", scannedIds);

    const participantMap = new Map((participants || []).map((p) => [p.id, p]));

    const codex: CodexEntry[] = scans
      .map((s) => {
        const p = participantMap.get(s.scanned_id);
        if (!p) return null;
        const char = getCharacterById(p.character_id);
        return {
          id: p.id,
          display_name: p.display_name,
          character_id: p.character_id,
          character: char,
          powers: p.powers || char.defaultPowers,
          level: p.level,
          scanned_at: s.created_at,
          is_mutual_ally: mutualSet.has(p.id),
        };
      })
      .filter(Boolean) as CodexEntry[];

    return { codex, totalHeroes: totalHeroes || 0 };
  }

  // Local Memory DB fallback
  const db = getMemoryDb();
  const myScans = db.scanEvents
    .filter((s) => s.scanner_id === scannerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const incomingSet = new Set(
    db.scanEvents.filter((s) => s.scanned_id === scannerId).map((s) => s.scanner_id)
  );

  const totalHeroes = db.participants.length;

  const codex: CodexEntry[] = myScans
    .map((s) => {
      const p = db.participants.find((part) => part.id === s.scanned_id);
      if (!p) return null;
      const char = getCharacterById(p.character_id);
      return {
        id: p.id,
        display_name: p.display_name,
        character_id: p.character_id,
        character: char,
        powers: p.powers || char.defaultPowers,
        level: p.level,
        scanned_at: s.created_at,
        is_mutual_ally: incomingSet.has(p.id),
      };
    })
    .filter(Boolean) as CodexEntry[];

  return { codex, totalHeroes };
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
