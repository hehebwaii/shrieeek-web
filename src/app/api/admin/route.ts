import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  getAllParticipants,
  getEventConfig,
  updateEventConfig,
  importParticipantsBatch,
  resetParticipantStats,
  getScanStats,
} from "@/lib/db";
import { getCharacterById } from "@/lib/characters";
import { broadcastUpdate } from "@/lib/sync";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const [participants, config, stats] = await Promise.all([
      getAllParticipants(),
      getEventConfig(),
      getScanStats(),
    ]);

    const roster = participants.map((p) => {
      const hero = getCharacterById(p.character_id);
      return {
        ...p,
        heroTitle: p.character_id ? hero.heroTitle : "UNASSIGNED",
      };
    });

    return NextResponse.json({
      success: true,
      config,
      stats,
      roster,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "toggle_event") {
      const config = await getEventConfig();
      const updated = await updateEventConfig({ is_event_active: !config.is_event_active });
      broadcastUpdate("CONFIG_CHANGE", updated);
      return NextResponse.json({ success: true, config: updated });
    }

    if (action === "toggle_leaderboard") {
      const config = await getEventConfig();
      const updated = await updateEventConfig({ is_leaderboard_public: !config.is_leaderboard_public });
      broadcastUpdate("CONFIG_CHANGE", updated);
      return NextResponse.json({ success: true, config: updated });
    }

    if (action === "import_batch") {
      const { items } = body; // Array of { phone, name } or raw string
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: "No participant data provided." }, { status: 400 });
      }
      const result = await importParticipantsBatch(items);
      broadcastUpdate("ROSTER_UPDATED");
      return NextResponse.json({ success: true, ...result });
    }

    if (action === "broadcast_announcement") {
      const { message, severity, durationMinutes } = body;
      if (!message || !message.trim()) {
        return NextResponse.json({ error: "Announcement message cannot be empty." }, { status: 400 });
      }

      const announcement = {
        id: `ann_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        message: message.trim(),
        severity: severity || "event",
        createdAt: new Date().toISOString(),
        expiresAt: durationMinutes ? new Date(Date.now() + durationMinutes * 60000).toISOString() : undefined,
      };

      const updated = await updateEventConfig({ active_announcement: announcement });
      broadcastUpdate("ANNOUNCEMENT", announcement);
      broadcastUpdate("CONFIG_CHANGE", updated);
      return NextResponse.json({ success: true, announcement, config: updated });
    }

    if (action === "clear_announcement") {
      const updated = await updateEventConfig({ active_announcement: null });
      broadcastUpdate("ANNOUNCEMENT", null);
      broadcastUpdate("CONFIG_CHANGE", updated);
      return NextResponse.json({ success: true, config: updated });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
