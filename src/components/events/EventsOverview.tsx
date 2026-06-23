"use client";

import { CalendarDays, Radio, Users } from "lucide-react";

import type { EventRecord } from "@/lib/types";

interface EventsOverviewProps {
  events: EventRecord[];
}

export function EventsOverview({ events }: EventsOverviewProps): React.JSX.Element {
  const liveCount = events.filter((event) => event.status === "live" || event.status === "published").length;
  const attendeeTotal = events.reduce((sum, event) => sum + event.attendeeCount, 0);

  const stats = [
    { label: "Total events", value: events.length, icon: CalendarDays },
    { label: "Published / live", value: liveCount, icon: Radio },
    { label: "Total RSVPs", value: attendeeTotal, icon: Users }
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {stats.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="rounded-2xl border border-border/70 bg-surface/50 px-4 py-3 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
            <Icon className="h-3.5 w-3.5 text-accent" />
            {label}
          </div>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
        </div>
      ))}
    </div>
  );
}
