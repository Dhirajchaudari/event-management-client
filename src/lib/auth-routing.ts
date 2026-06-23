import type { ActiveUserRole, UserRole } from "@/lib/types";
import { normalizeUserRole } from "@/lib/types";

export type LoginPortal = ActiveUserRole;

export function getDashboardPathForRole(role: UserRole): string {
  const normalized = normalizeUserRole(role);
  if (normalized === "attendee") {
    return "/my-events";
  }
  return "/events";
}

export function roleMatchesPortal(role: UserRole, portal: LoginPortal): boolean {
  return normalizeUserRole(role) === portal;
}

export function getPortalLabel(portal: LoginPortal): string {
  switch (portal) {
    case "admin":
      return "Admin";
    case "organizer":
      return "Organizer";
    case "attendee":
      return "Attendee";
  }
}

export function getRegisterRoleForPortal(portal: LoginPortal): "organizer" | "attendee" | null {
  if (portal === "organizer" || portal === "attendee") {
    return portal;
  }
  return null;
}
