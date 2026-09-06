import { NextRequest, NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import {
  getParticipantByQrToken,
  getParticipantByManualCode,
  recordScanEvent,
} from "@/lib/db";
import { getCharacterById } from "@/lib/characters";
import { broadcastUpdate } from "@/lib/sync";

export async function POST(req: NextRequest) {
  try {
    const scanner = await getCurrentParticipant();
    if (!scanner) {
      return NextResponse.json({ error: "Unauthorized: Please log in to scan." }, { status: 401 });
    }

    const body = await req.json();
    const { qrToken, manualCode } = body;

    if (!qrToken && !manualCode) {
      return NextResponse.json(
        { error: "Please provide a valid QR code or manual code." },
        { status: 400 }
      );
    }

    // Resolve scanned participant
    let scannedParticipant = null;
    if (qrToken) {
      scannedParticipant = await getParticipantByQrToken(qrToken);
    } else if (manualCode) {
      scannedParticipant = await getParticipantByManualCode(manualCode);
    }

    if (!scannedParticipant) {
      return NextResponse.json(
        { error: "Invalid QR code or manual code. No participant found." },
        { status: 404 }
      );
    }

    // Atomic scan execution & anti-abuse validation
    const result = await recordScanEvent(scanner.id, scannedParticipant.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const hero = getCharacterById(scannedParticipant.character_id);

    broadcastUpdate("SCAN_AWARDED", {
      scannerId: scanner.id,
      scannedId: scannedParticipant.id,
      newXp: result.scanner?.xp,
      newLevel: result.newLevel,
    });

    return NextResponse.json({
      success: true,
      scanner: result.scanner,
      scanned: {
        id: scannedParticipant.id,
        display_name: scannedParticipant.display_name,
        powers: scannedParticipant.powers || hero.defaultPowers,
        character_id: scannedParticipant.character_id,
        level: scannedParticipant.level,
        character: hero,
      },
      xpAwarded: result.xpAwarded,
      newLevel: result.newLevel,
      leveledUp: result.leveledUp,
      message: `Hero Discovered! Unlocked ${scannedParticipant.display_name}'s (${hero.heroTitle}) card in your Codex! +${result.xpAwarded} XP!`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
