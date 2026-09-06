import { NextRequest, NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import { getParticipantByQrToken, getParticipantByManualCode } from "@/lib/db";
import { createDuelSession } from "@/lib/duel";

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

    // Initialize 2-player live duel session
    const duelResult = await createDuelSession(scanner, scannedParticipant);

    if (!duelResult.success) {
      return NextResponse.json({ error: duelResult.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      duelSession: duelResult.session,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
