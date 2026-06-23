import { EVENT_STATUSES, type EventStatus } from "@/lib/types";

const STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Draft",
  published: "Published",
  live: "Live",
  completed: "Completed"
};

const STATUS_VARIANTS: Record<EventStatus, string> = {
  draft: "border-muted/40 bg-muted/10 text-muted",
  published: "border-teal/30 bg-teal/10 text-teal",
  live: "border-accent/40 bg-accent/10 text-accent",
  completed: "border-green/30 bg-green/10 text-green"
};

export function getEventStatusLabel(status: EventStatus): string {
  return STATUS_LABELS[status];
}

export function getEventStatusClassName(status: EventStatus): string {
  return STATUS_VARIANTS[status];
}

export function isLiveStatus(status: EventStatus): boolean {
  return status === "live";
}

export function isStatusTransitionAllowed(from: EventStatus, to: EventStatus): boolean {
  if (from === to) {
    return true;
  }

  const fromIndex = EVENT_STATUSES.indexOf(from);
  const toIndex = EVENT_STATUSES.indexOf(to);

  if (fromIndex === -1 || toIndex === -1) {
    return false;
  }

  return toIndex === fromIndex + 1;
}

export function isStatusOptionDisabled(current: EventStatus, option: EventStatus): boolean {
  return !isStatusTransitionAllowed(current, option);
}
