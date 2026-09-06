"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { EventConfig, Announcement } from "@/lib/types";

export interface SyncPayload {
  type:
    | "INIT"
    | "CONFIG_CHANGE"
    | "PARTICIPANT_RESET"
    | "SCAN_AWARDED"
    | "ROSTER_UPDATED"
    | "ANNOUNCEMENT";
  config?: EventConfig;
  payload?: any;
  timestamp: number;
}

export interface UseEventSyncOptions {
  onConfigChange?: (config: EventConfig) => void;
  onParticipantReset?: (payload: { participantId: string }) => void;
  onScanAwarded?: (payload: { scannerId: string; scannedId: string; newXp?: number; newLevel?: number }) => void;
  onRosterUpdated?: () => void;
  onAnnouncement?: (announcement: Announcement | null) => void;
  onAnyUpdate?: (data: SyncPayload) => void;
}

export function useEventSync(options?: UseEventSyncOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let isSubscribed = true;

    function connect() {
      if (!isSubscribed) return;

      try {
        eventSource = new EventSource("/api/sync");

        eventSource.onopen = () => {
          if (isSubscribed) {
            setIsConnected(true);
          }
        };

        eventSource.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const data: SyncPayload = JSON.parse(event.data);

            if (data.type === "INIT" && data.config) {
              setConfig(data.config);
              const activeAnn = data.config.active_announcement || null;
              setAnnouncement(activeAnn);
              optionsRef.current?.onConfigChange?.(data.config);
              optionsRef.current?.onAnnouncement?.(activeAnn);
            } else if (data.type === "CONFIG_CHANGE") {
              const newConfig = data.payload || data.config;
              if (newConfig) {
                setConfig(newConfig);
                const activeAnn = newConfig.active_announcement || null;
                setAnnouncement(activeAnn);
                optionsRef.current?.onConfigChange?.(newConfig);
                optionsRef.current?.onAnnouncement?.(activeAnn);
              }
            } else if (data.type === "ANNOUNCEMENT") {
              const ann = data.payload || null;
              setAnnouncement(ann);
              optionsRef.current?.onAnnouncement?.(ann);
            } else if (data.type === "PARTICIPANT_RESET") {
              optionsRef.current?.onParticipantReset?.(data.payload);
            } else if (data.type === "SCAN_AWARDED") {
              optionsRef.current?.onScanAwarded?.(data.payload);
            } else if (data.type === "ROSTER_UPDATED") {
              optionsRef.current?.onRosterUpdated?.();
            }

            optionsRef.current?.onAnyUpdate?.(data);
          } catch {
            // Ignore parse errors (e.g. heartbeat comments)
          }
        };

        eventSource.onerror = () => {
          if (!isSubscribed) return;
          setIsConnected(false);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Attempt reconnect after 3 seconds
          if (!reconnectTimeout) {
            reconnectTimeout = setTimeout(() => {
              reconnectTimeout = null;
              connect();
            }, 3000);
          }
        };
      } catch (err) {
        setIsConnected(false);
        if (!reconnectTimeout) {
          reconnectTimeout = setTimeout(() => {
            reconnectTimeout = null;
            connect();
          }, 3000);
        }
      }
    }

    connect();

    return () => {
      isSubscribed = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  }, []);

  return { isConnected, config, announcement };
}
