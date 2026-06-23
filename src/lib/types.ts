export type UserRole = "admin" | "user";

export type EventStatus = "draft" | "published" | "live" | "completed";

export const EVENT_STATUSES: EventStatus[] = ["draft", "published", "live", "completed"];

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface EventRecord {
  id: string;
  name: string;
  date: string;
  speakerName: string;
  speakerDesignation: string;
  speakerPhotoUrl?: string | null;
  status: EventStatus;
  attendeeCount: number;
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
