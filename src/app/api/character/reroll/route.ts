import { NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import { getRandomCharacter } from "@/lib/characters";
import { updateParticipant } from "@/lib/db";

export async function POST() {
  try {
    const participant = await getCurrentParticipant();
    if (!participant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (participant.reroll_count >= 1) {
      return NextResponse.json(
        { error: "Re-roll limit reached. You are only allowed 1 character re-roll." },
        { status: 400 }
      );
    }

    const currentHeroId = participant.character_id || undefined;
    const newHero = getRandomCharacter(currentHeroId);

    const updated = await updateParticipant(participant.id, {
      character_id: newHero.id,
      powers: newHero.defaultPowers,
      reroll_count: participant.reroll_count + 1,
    });

    return NextResponse.json({
      success: true,
      participant: updated,
      character: newHero,
      message: "Character re-rolled successfully!",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
