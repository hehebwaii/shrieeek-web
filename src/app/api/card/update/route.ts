import { NextRequest, NextResponse } from "next/server";
import { getCurrentParticipant } from "@/lib/auth";
import { updateParticipant } from "@/lib/db";

// Helper function to sanitize user input and prevent XSS
function sanitizeText(text: string, maxLength: number): string {
  return String(text)
    .replace(/[<>]/g, "") // Strip HTML tag angle brackets
    .trim()
    .slice(0, maxLength);
}

export async function POST(req: NextRequest) {
  try {
    const participant = await getCurrentParticipant();
    if (!participant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { displayName, powers } = await req.json();

    const updates: { display_name?: string; powers?: string } = {};

    if (typeof displayName === "string") {
      const sanitizedName = sanitizeText(displayName, 32);
      if (sanitizedName.length > 0) {
        updates.display_name = sanitizedName;
      }
    }

    if (typeof powers === "string") {
      const sanitizedPowers = sanitizeText(powers, 160);
      updates.powers = sanitizedPowers;
    }

    const updated = await updateParticipant(participant.id, updates);

    return NextResponse.json({
      success: true,
      participant: updated,
      message: "Card updated successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
