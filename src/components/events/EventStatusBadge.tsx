"use client";

import { getEventStatusClassName, getEventStatusLabel, isLiveStatus } from "@/lib/event-status";
import type { EventStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EventStatusBadgeProps {
  status: EventStatus;
  className?: string;
}

export function EventStatusBadge({ status, className }: EventStatusBadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        getEventStatusClassName(status),
        className
      )}
    >
      {isLiveStatus(status) ? (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/70 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
      ) : null}
      {getEventStatusLabel(status)}
    </span>
  );
}
