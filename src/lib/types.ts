export type UserRole = "admin" | "user";

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
  createdAt: string;
  updatedAt: string;
}

export interface EventFormValues {
  name: string;
  date: string;
  speakerName: string;
  speakerDesignation: string;
}

export const EMPTY_EVENT_FORM: EventFormValues = {
  name: "",
  date: "",
  speakerName: "",
  speakerDesignation: ""
};
