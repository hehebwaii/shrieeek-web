import { NextRequest } from "next/server";
import { syncEmitter } from "@/lib/sync";
import { getEventConfig } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial config
      try {
        const config = await getEventConfig();
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "INIT", config, timestamp: Date.now() })}\n\n`)
        );
      } catch {}

      // Listener for broadcast events
      const listener = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          // Stream might be closed
        }
      };

      syncEmitter.on("update", listener);

      // Keepalive heartbeat every 15s to prevent connection drop on mobile networks
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keepalive\n\n`));
        } catch {
          clearInterval(interval);
        }
      }, 15000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        syncEmitter.off("update", listener);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
