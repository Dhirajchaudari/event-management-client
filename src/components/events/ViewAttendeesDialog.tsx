"use client";

import { Users } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { getEventStatusLabel } from "@/lib/event-status";
import { formatEventDate } from "@/lib/format";
import type { EventRecord } from "@/lib/types";

interface ViewAttendeesDialogProps {
  event: EventRecord | null;
  onClose: () => void;
}

export function ViewAttendeesDialog({
  event,
  onClose
}: ViewAttendeesDialogProps): React.JSX.Element {
  return (
    <Dialog open={event !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attendees</DialogTitle>
          <DialogDescription>
            {event ? `Registration overview for "${event.name}".` : ""}
          </DialogDescription>
        </DialogHeader>

        {event ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/70 bg-background/35 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{event.attendeeCount}</p>
                  <p className="text-sm text-muted">Registered attendees</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center">
              <p className="text-sm font-medium text-foreground">No attendee list yet</p>
              <p className="mt-2 text-sm text-muted">
                Attendee registration is tracked by count for now. Detailed roster management can be
                added in a future release.
              </p>
            </div>

            <dl className="grid gap-3 rounded-2xl border border-border/60 bg-surface/50 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Event date</dt>
                <dd className="text-foreground">{formatEventDate(event.date)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Status</dt>
                <dd className="text-foreground">{getEventStatusLabel(event.status)}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
