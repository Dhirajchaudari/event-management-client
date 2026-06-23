"use client";

import { Check, ClipboardList, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatEventDate } from "@/lib/format";
import { getPublicEventPath } from "@/lib/event-slug";
import type { EventRecord } from "@/lib/types";

interface PendingApprovalsPanelProps {
  events: EventRecord[];
  loading?: boolean;
  onApprove: (event: EventRecord) => void;
  onReject: (event: EventRecord) => void;
}

export function PendingApprovalsPanel({
  events,
  loading = false,
  onApprove,
  onReject
}: PendingApprovalsPanelProps): React.JSX.Element {
  return (
    <section className="rounded-[1.5rem] border border-amber/30 bg-gradient-to-br from-amber/8 to-background/40 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber/25 bg-amber/10">
          <ClipboardList className="h-5 w-5 text-amber" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-amber">
            Organizer submissions
          </p>
          <h2 className="font-display mt-1 text-xl font-semibold text-foreground">
            {events.length === 0
              ? "No events awaiting review"
              : `${events.length} event${events.length === 1 ? "" : "s"} awaiting review`}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {events.length === 0
              ? "When an organizer submits an event, it will appear here for you to approve or send back."
              : "Review each submission below. Approving publishes it on the public site."}
          </p>
        </div>
      </div>

      {events.length > 0 ? (
        <div className="mt-5 space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background/50 p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground">{event.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {event.speakerName} · {formatEventDate(event.date)}
                </p>
                <p className="mt-1 truncate text-xs text-muted">
                  Public URL: {getPublicEventPath(event)}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button size="sm" disabled={loading} onClick={() => onApprove(event)}>
                  <Check className="h-4 w-4" />
                  Approve & publish
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={loading}
                  onClick={() => onReject(event)}
                >
                  <X className="h-4 w-4" />
                  Send back to draft
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
