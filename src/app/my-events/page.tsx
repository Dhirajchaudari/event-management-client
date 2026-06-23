"use client";

import { CalendarDays, ExternalLink, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublicEventPath } from "@/lib/event-slug";
import { getEventStatusClassName, getEventStatusLabel } from "@/lib/event-status";
import { normalizeEventRecord } from "@/lib/event-graphql";
import { formatEventDate } from "@/lib/format";
import { gqlRequest, UnauthorizedError } from "@/lib/graphql";
import type { EventRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { pushToast } from "@/store/toast.store";

const EVENT_FIELDS = `
  id
  slug
  name
  date
  speakerName
  speakerDesignation
  speakerPhotoUrl
  status
  attendeeCount
  createdAt
  updatedAt
`;

export default function MyEventsPage(): React.JSX.Element {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await gqlRequest<{ myRegisteredEvents: EventRecord[] }>(
        `query { myRegisteredEvents { ${EVENT_FIELDS} } }`
      );
      setEvents(data.myRegisteredEvents.map(normalizeEventRecord));
    } catch (error) {
      if (error instanceof UnauthorizedError) return;
      const message = error instanceof Error ? error.message : "Failed to load your events";
      pushToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const upcoming = useMemo(
    () => events.filter((event) => new Date(event.date).getTime() >= Date.now()),
    [events]
  );

  return (
    <AppShell
      title="My events"
      subtitle="Track the sessions you have registered for and open their public pages anytime."
    >
      <div id="insights" className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[1.5rem] border border-border/70 bg-surface/70 p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Registered</p>
          <p className="font-display mt-2 text-3xl font-semibold text-foreground">{events.length}</p>
        </div>
        <div className="rounded-[1.5rem] border border-border/70 bg-surface/70 p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Upcoming</p>
          <p className="font-display mt-2 text-3xl font-semibold text-foreground">{upcoming.length}</p>
        </div>
        <div className="rounded-[1.5rem] border border-border/70 bg-surface/70 p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Completed</p>
          <p className="font-display mt-2 text-3xl font-semibold text-foreground">
            {events.length - upcoming.length}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-[1.5rem] border border-border/50 bg-surface/40"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-surface/40 px-6 py-16 text-center">
          <Users className="mx-auto h-10 w-10 text-muted" />
          <h2 className="font-display mt-4 text-2xl font-semibold text-foreground">
            No registrations yet
          </h2>
          <p className="mt-2 text-sm text-muted">
            When you register for a public event, it will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <article
              key={event.id}
              className="rounded-[1.5rem] border border-border/70 bg-surface/70 p-5 sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                        getEventStatusClassName(event.status)
                      )}
                    >
                      {getEventStatusLabel(event.status)}
                    </span>
                    <Badge variant="muted" className="normal-case tracking-normal">
                      Registered
                    </Badge>
                  </div>
                  <h3 className="font-display mt-3 text-xl font-semibold text-foreground">
                    {event.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{event.speakerName}</p>
                  <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted">
                    <CalendarDays className="h-4 w-4 text-accent" />
                    {formatEventDate(event.date)}
                  </div>
                </div>

                <Button variant="secondary" asChild>
                  <Link href={getPublicEventPath(event)} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    View event page
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}
