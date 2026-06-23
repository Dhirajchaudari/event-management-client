import { useAuthStore } from "@/store/auth.store";

const UNAUTHORIZED_MARKERS = [
  "unauthenticated",
  "unauthorized",
  "not authenticated",
  "access denied"
];

export function isUnauthorizedError(message: string): boolean {
  const normalized = message.toLowerCase();
  return UNAUTHORIZED_MARKERS.some((marker) => normalized.includes(marker));
}

export function isUnauthorizedStatus(status: number): boolean {
  return status === 401 || status === 403;
}

export class UnauthorizedError extends Error {
  public constructor(message = "UNAUTHENTICATED") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export function handleUnauthorizedRedirect(): void {
  useAuthStore.getState().resetAuth();

  if (typeof window === "undefined") {
    return;
  }

  const path = window.location.pathname;
  if (path !== "/login") {
    window.location.replace("/login");
  }
}
