import { EventEmitter } from "events";

// Global singleton event emitter for broadcasting live updates to all connected participant clients
class SyncEmitter extends EventEmitter {}

declare global {
  var __shrieeek_sync_emitter: SyncEmitter | undefined;
}

export const syncEmitter: SyncEmitter =
  global.__shrieeek_sync_emitter || (global.__shrieeek_sync_emitter = new SyncEmitter());

// Max listeners for 200+ concurrent live SSE connections
syncEmitter.setMaxListeners(500);

export function broadcastUpdate(
  type:
    | "CONFIG_CHANGE"
    | "PARTICIPANT_RESET"
    | "SCAN_AWARDED"
    | "ROSTER_UPDATED"
    | "ANNOUNCEMENT",
  payload?: any
) {
  syncEmitter.emit("update", {
    type,
    payload,
    timestamp: Date.now(),
  });
}
