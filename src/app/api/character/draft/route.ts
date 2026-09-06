import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import { getRandomCharacter, getCharacterById } from "@/lib/characters";
import { updateParticipant } from "@/lib/db";

export async function POST() {
  try {
    const participant = await getCurrentParticipant();
    if (!participant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (participant.character_id) {
      const existingHero = getCharacterById(participant.character_id);
      return NextResponse.json({
        success: true,
        participant,
        character: existingHero,
        message: "Character already assigned.",
      });
    }

    const assigned = getRandomCharacter();
    const updated = await updateParticipant(participant.id, {
      character_id: assigned.id,
      powers: participant.powers || assigned.defaultPowers,
      display_name: participant.display_name || assigned.name,
    });

    return NextResponse.json({
      success: true,
      participant: updated,
      character: assigned,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
