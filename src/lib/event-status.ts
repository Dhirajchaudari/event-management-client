import { EVENT_STATUSES, type EventStatus } from "@/lib/types";

const STATUS_LABELS: Record<EventStatus, string> = {
  pending_approval: "Pending approval",
  draft: "Draft",
  published: "Published",
  live: "Live",
  completed: "Completed"
};

const STATUS_VARIANTS: Record<EventStatus, string> = {
  pending_approval: "border-amber/40 bg-amber/10 text-amber",
  draft: "border-muted/40 bg-muted/10 text-muted",
  published: "border-teal/30 bg-teal/10 text-teal",
  live: "border-accent/40 bg-accent/10 text-accent",
  completed: "border-green/30 bg-green/10 text-green"
};

export function getEventStatusLabel(status: EventStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function getEventStatusClassName(status: EventStatus): string {
  return STATUS_VARIANTS[status] ?? STATUS_VARIANTS.draft;
}

export function isLiveStatus(status: EventStatus): boolean {
  return status === "live";
}

export function isPublicEventStatus(status: EventStatus): boolean {
  return status === "published" || status === "live" || status === "completed";
}

export function isStatusTransitionAllowed(from: EventStatus, to: EventStatus): boolean {
  if (from === to) {
    return true;
  }

  if (from === "pending_approval") {
    return false;
  }

  const lifecycle: EventStatus[] = ["draft", "published", "live", "completed"];
  const fromIndex = lifecycle.indexOf(from);
  const toIndex = lifecycle.indexOf(to);

  if (fromIndex === -1 || toIndex === -1) {
    return false;
  }

  return toIndex === fromIndex + 1;
}

export function isStatusOptionDisabled(current: EventStatus, option: EventStatus): boolean {
  if (current === "pending_approval") {
    return true;
  }
  return !isStatusTransitionAllowed(current, option);
}

export function getLifecycleStatuses(): EventStatus[] {
  return EVENT_STATUSES.filter((status) => status !== "pending_approval");
}
