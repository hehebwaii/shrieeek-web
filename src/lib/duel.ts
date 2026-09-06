import { DuelSession, ClashTactic, Participant } from "./types";
import { getCharacterById } from "./characters";
import { broadcastUpdate } from "./sync";
import { recordDuelScanEvent, hasAlreadyScanned, getEventConfig } from "./db";

declare global {
  var __shrieeek_active_duels: Map<string, DuelSession> | undefined;
  var __shrieeek_duel_timeouts: Map<string, NodeJS.Timeout> | undefined;
}

const activeDuels: Map<string, DuelSession> =
  global.__shrieeek_active_duels || (global.__shrieeek_active_duels = new Map());

const duelTimeouts: Map<string, NodeJS.Timeout> =
  global.__shrieeek_duel_timeouts || (global.__shrieeek_duel_timeouts = new Map());

export async function createDuelSession(
  scanner: Participant,
  scanned: Participant
): Promise<{ success: boolean; error?: string; session?: DuelSession }> {
  const config = await getEventConfig();
  if (!config.is_event_active) {
    return { success: false, error: "Event scanning is currently paused by organizers." };
  }

  if (scanner.id === scanned.id) {
    return { success: false, error: "Self-scan blocked: You cannot duel your own QR code!" };
  }

  const alreadyScanned = await hasAlreadyScanned(scanner.id, scanned.id);
  if (alreadyScanned) {
    return { success: false, error: `You have already scanned ${scanned.display_name}'s QR code!` };
  }

  const scannerHero = getCharacterById(scanner.character_id);
  const scannedHero = getCharacterById(scanned.character_id);

  const duelId = `duel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const session: DuelSession = {
    duelId,
    scannerId: scanner.id,
    scannedId: scanned.id,
    scannerName: scanner.display_name,
    scannerHero: scannerHero.heroTitle,
    scannedName: scanned.display_name,
    scannedHero: scannedHero.heroTitle,
    status: "WAITING_CHOICES",
    createdAt: Date.now(),
    expiresAt: Date.now() + 10000, // 10 seconds live countdown
  };

  activeDuels.set(duelId, session);

  // Broadcast duel start to both players in real time
  broadcastUpdate("DUEL_START", session);

  // Set timeout to auto-resolve if one or both players don't pick in 10.5 seconds
  const timeout = setTimeout(async () => {
    try {
      await autoResolveDuelSession(duelId);
    } catch (err) {
      console.error("Auto-resolve duel error:", err);
    }
  }, 10500);

  duelTimeouts.set(duelId, timeout);

  return { success: true, session };
}

export function getDuelSession(duelId: string): DuelSession | null {
  return activeDuels.get(duelId) || null;
}

export async function submitDuelChoice(
  duelId: string,
  participantId: string,
  tactic: ClashTactic
): Promise<{ success: boolean; error?: string; session?: DuelSession }> {
  const session = activeDuels.get(duelId);
  if (!session) {
    return { success: false, error: "Duel session not found or already ended." };
  }

  if (session.status !== "WAITING_CHOICES") {
    return { success: true, session };
  }

  if (participantId === session.scannerId) {
    session.scannerTactic = tactic;
  } else if (participantId === session.scannedId) {
    session.scannedTactic = tactic;
  } else {
    return { success: false, error: "Unauthorized: You are not a participant in this duel." };
  }

  // Notify players that a choice was submitted
  broadcastUpdate("DUEL_PLAYER_READY", { duelId, participantId });

  // If both players have made their choice, resolve immediately!
  if (session.scannerTactic && session.scannedTactic) {
    const timer = duelTimeouts.get(duelId);
    if (timer) clearTimeout(timer);
    duelTimeouts.delete(duelId);

    const resolvedSession = await resolveDuelSession(session);
    return { success: true, session: resolvedSession };
  }

  return { success: true, session };
}

async function autoResolveDuelSession(duelId: string) {
  const session = activeDuels.get(duelId);
  if (!session || session.status !== "WAITING_CHOICES") return;

  // If scanner didn't pick, default to STRIKE
  if (!session.scannerTactic) {
    session.scannerTactic = "STRIKE";
  }

  // If defender didn't pick, roll their hero combat class profile
  if (!session.scannedTactic) {
    const roll = Math.random();
    session.scannedTactic = roll < 0.34 ? "STRIKE" : roll < 0.67 ? "SHIELD" : "BLITZ";
  }

  await resolveDuelSession(session);
}

async function resolveDuelSession(session: DuelSession): Promise<DuelSession> {
  const scannerTactic = session.scannerTactic || "STRIKE";
  const scannedTactic = session.scannedTactic || "SHIELD";

  session.status = "RESOLVED";

  // Record atomic scan event & update XP
  const result = await recordDuelScanEvent(
    session.scannerId,
    session.scannedId,
    scannerTactic,
    scannedTactic
  );

  if (result.success) {
    session.scannerResult = result.scannerResult;
    session.scannedResult = result.scannedResult;

    // Broadcast resolution to both participant screens
    broadcastUpdate("DUEL_RESOLVED", {
      duelId: session.duelId,
      scannerId: session.scannerId,
      scannedId: session.scannedId,
      scannerResult: result.scannerResult,
      scannedResult: result.scannedResult,
      newLevelScanner: result.newLevelScanner,
      newLevelScanned: result.newLevelScanned,
    });

    // Broadcast standard scan awarded so leaderboards and rosters update
    broadcastUpdate("SCAN_AWARDED", {
      scannerId: session.scannerId,
      scannedId: session.scannedId,
      newXp: result.scanner?.xp,
      newLevel: result.newLevelScanner,
    });
  }

  // Cleanup after 30 seconds
  setTimeout(() => {
    activeDuels.delete(session.duelId);
    duelTimeouts.delete(session.duelId);
  }, 30000);

  return session;
}
