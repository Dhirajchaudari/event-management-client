export type UserRole = "admin" | "organizer" | "attendee" | "user";

export type ActiveUserRole = "admin" | "organizer" | "attendee";

export type EventStatus =
  | "pending_approval"
  | "draft"
  | "published"
  | "live"
  | "completed";

export const EVENT_STATUSES: EventStatus[] = [
  "pending_approval",
  "draft",
  "published",
  "live",
  "completed"
];

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
}

export function normalizeUserRole(role: UserRole): ActiveUserRole {
  if (role === "user") {
    return "organizer";
  }
  return role;
}

export function isAdminRole(role: UserRole): boolean {
  return normalizeUserRole(role) === "admin";
}

export function isOrganizerRole(role: UserRole): boolean {
  return normalizeUserRole(role) === "organizer";
}

export function isAttendeeRole(role: UserRole): boolean {
  return normalizeUserRole(role) === "attendee";
}

export interface AttendeeRecord {
  id: string;
  eventId: string;
  name: string;
  email: string;
  specialty?: string | null;
  rsvpAt: string;
}

export interface EventRecord {
  id: string;
  slug: string;
  name: string;
  date: string;
  speakerName: string;
  speakerDesignation: string;
  speakerPhotoUrl?: string | null;
  organizerId?: string | null;
  status: EventStatus;
  attendeeCount: number;
  attendees?: AttendeeRecord[];
  aiDescription?: string | null;
  aiSpeakerIntro?: string | null;
  aiGeneratedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventFormValues {
  name: string;
  date: string;
  speakerName: string;
  speakerDesignation: string;
  speakerPhotoUrl: string;
}

export const EMPTY_EVENT_FORM: EventFormValues = {
  name: "",
  date: "",
  speakerName: "",
  speakerDesignation: "",
  speakerPhotoUrl: ""
};
