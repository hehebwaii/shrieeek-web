import { NextResponse } from "next/server";
import { getEventConfig } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const config = await getEventConfig();
    return NextResponse.json(
      {
        success: true,
        config,
        is_event_active: Boolean(config.is_event_active),
        is_leaderboard_public: Boolean(config.is_leaderboard_public),
        active_announcement: config.active_announcement || null,
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
