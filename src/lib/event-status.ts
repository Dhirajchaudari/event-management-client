import type { EventStatus } from "@/lib/types";

const STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Draft",
  published: "Published",
  completed: "Completed",
  cancelled: "Cancelled"
};

const STATUS_VARIANTS: Record<EventStatus, string> = {
  draft: "border-muted/40 bg-muted/10 text-muted",
  published: "border-accent/30 bg-accent/10 text-accent",
  completed: "border-teal/30 bg-teal/10 text-teal",
  cancelled: "border-danger/30 bg-danger/10 text-danger"
};

export function getEventStatusLabel(status: EventStatus): string {
  return STATUS_LABELS[status];
}

export function getEventStatusClassName(status: EventStatus): string {
  return STATUS_VARIANTS[status];
}
