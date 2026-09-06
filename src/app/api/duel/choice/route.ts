import { NextRequest, NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import { submitDuelChoice, getDuelSession } from "@/lib/duel";

export async function POST(req: NextRequest) {
  try {
    const participant = await getCurrentParticipant();
    if (!participant) {
      return NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 });
    }

    const body = await req.json();
    const { duelId, tactic } = body;

    if (!duelId || !tactic) {
      return NextResponse.json({ error: "Missing duelId or tactic." }, { status: 400 });
    }

    const result = await submitDuelChoice(duelId, participant.id, tactic);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      duelSession: result.session,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const duelId = searchParams.get("duelId");
  if (!duelId) {
    return NextResponse.json({ error: "Missing duelId." }, { status: 400 });
  }

  const session = getDuelSession(duelId);
  return NextResponse.json({ success: Boolean(session), session });
}
