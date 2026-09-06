import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import { getCharacterById } from "@/lib/characters";

export async function GET() {
  try {
    const participant = await getCurrentParticipant();
    if (!participant) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const character = participant.character_id
      ? getCharacterById(participant.character_id)
      : null;

    return NextResponse.json({
      authenticated: true,
      participant,
      character,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
