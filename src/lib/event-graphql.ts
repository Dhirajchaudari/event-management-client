import { EVENT_STATUSES, type EventRecord, type EventStatus } from "@/lib/types";

export function normalizeEventStatus(value: string): EventStatus {
  const normalized = value.toLowerCase() as EventStatus;
  if (EVENT_STATUSES.includes(normalized)) {
    return normalized;
  }
  return "draft";
}

export function normalizeEventRecord(event: EventRecord): EventRecord {
  return {
    ...event,
    status: normalizeEventStatus(String(event.status))
  };
}
