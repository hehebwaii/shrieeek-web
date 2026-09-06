import { NextRequest, NextResponse } from "next/server";
import { getAllParticipants, getEventConfig } from "@/lib/db";
import { getCurrentParticipant } from "@/lib/auth";
import { getCharacterById } from "@/lib/characters";
import { getTierForLevel } from "@/lib/progression";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const config = await getEventConfig();
    const currentParticipant = await getCurrentParticipant();

    if (!config.is_leaderboard_public) {
      return NextResponse.json(
        {
          isPublic: false,
          message: "The leaderboard is currently hidden by event organizers.",
          myStats: currentParticipant
            ? {
                rank: null,
                displayName: currentParticipant.display_name,
                xp: currentParticipant.xp,
                level: currentParticipant.level,
              }
            : null,
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    const participants = await getAllParticipants();

    const ranked = participants.map((p, index) => {
      const hero = getCharacterById(p.character_id);
      const tier = getTierForLevel(p.level);
      return {
        rank: index + 1,
        id: p.id,
        displayName: p.display_name,
        heroTitle: hero.heroTitle,
        heroId: hero.id,
        heroAccent: hero.accentColor,
        level: p.level,
        xp: p.xp,
        tierName: tier.tierName,
        tierBadge: tier.badge,
        lastScanAt: p.last_scan_at,
        isCurrent: currentParticipant?.id === p.id,
      };
    });

    return NextResponse.json(
      {
        isPublic: true,
        leaderboard: ranked,
        totalParticipants: participants.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
