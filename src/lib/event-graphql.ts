import { EVENT_STATUSES, type EventRecord, type EventStatus } from "@/lib/types";
import { gqlPublicRequest } from "@/lib/public-graphql";

export const PUBLIC_EVENT_FIELDS = `
  id
  name
  date
  speakerName
  speakerDesignation
  speakerPhotoUrl
  status
  attendeeCount
  aiDescription
  aiSpeakerIntro
  aiGeneratedAt
  createdAt
  updatedAt
`;

export async function fetchPublicEvent(id: string): Promise<EventRecord | null> {
  const data = await gqlPublicRequest<{ getPublicEvent: EventRecord | null }>(
    `query GetPublicEvent($id: ID!) {
      getPublicEvent(id: $id) {
        ${PUBLIC_EVENT_FIELDS}
      }
    }`,
    { id }
  );

  if (!data.getPublicEvent) {
    return null;
  }

  return normalizeEventRecord({
    ...data.getPublicEvent,
    attendeeCount: data.getPublicEvent.attendeeCount ?? 0
  });
}

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
