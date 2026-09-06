import { NextRequest, NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import { getParticipantCodex } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const participant = await getCurrentParticipant();
    if (!participant) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to view your Alliance Codex." },
        { status: 401 }
      );
    }

    const { codex, totalHeroes } = await getParticipantCodex(participant.id);

    return NextResponse.json({
      success: true,
      codex,
      totalHeroes,
      discoveredCount: codex.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
