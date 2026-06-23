import { EVENT_STATUSES, type EventRecord, type EventStatus } from "@/lib/types";
import { gqlPublicRequest } from "@/lib/public-graphql";
import { slugifyEventName } from "@/lib/event-slug";

export type PublicEventLookupCode =
  | "OK"
  | "NOT_FOUND"
  | "NOT_PUBLISHED"
  | "PENDING_APPROVAL";

export interface PublicEventLookupResult {
  code: PublicEventLookupCode;
  event?: EventRecord | null;
  status?: EventStatus | null;
}

export const PUBLIC_EVENT_FIELDS = `
  id
  slug
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

export async function lookupPublicEvent(slug: string): Promise<PublicEventLookupResult> {
  const data = await gqlPublicRequest<{
    publicEventLookup: {
      code: PublicEventLookupCode;
      event?: EventRecord | null;
      status?: EventStatus | null;
    };
  }>(
    `query PublicEventLookup($slug: String!) {
      publicEventLookup(slug: $slug) {
        code
        status
        event {
          ${PUBLIC_EVENT_FIELDS}
        }
      }
    }`,
    { slug }
  );

  const lookup = data.publicEventLookup;

  return {
    code: lookup.code,
    status: lookup.status ?? null,
    event: lookup.event
      ? normalizeEventRecord({
          ...lookup.event,
          attendeeCount: lookup.event.attendeeCount ?? 0
        })
      : null
  };
}

export async function fetchPublicEvent(slug: string): Promise<EventRecord | null> {
  const lookup = await lookupPublicEvent(slug);
  if (lookup.code !== "OK" || !lookup.event) {
    return null;
  }
  return lookup.event;
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
    slug: event.slug || slugifyEventName(event.name) || event.id,
    status: normalizeEventStatus(String(event.status))
  };
}
