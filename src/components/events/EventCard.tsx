"use client";

import {
  CalendarDays,
  FileDown,
  Pencil,
  Trash2,
  UserRound,
  Users
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEventDate, getInitials } from "@/lib/format";
import { getEventStatusClassName, getEventStatusLabel } from "@/lib/event-status";
import type { EventRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: EventRecord;
  onEdit: (event: EventRecord) => void;
  onDelete: (event: EventRecord) => void;
  onExportPdf: (event: EventRecord) => void;
  onUpdateStatus: (event: EventRecord) => void;
  onViewAttendees: (event: EventRecord) => void;
}

export function EventCard({
  event,
  onEdit,
  onDelete,
  onExportPdf,
  onUpdateStatus,
  onViewAttendees
}: EventCardProps): React.JSX.Element {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface/70 backdrop-blur-sm transition duration-300",
        "hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_24px_60px_-30px_rgba(232,165,75,0.45)]"
      )}
    >
      <div className="border-b border-border/60 bg-background/30 p-5">
        <div className="flex items-start gap-4">
          <Avatar key={event.speakerPhotoUrl || `${event.id}-no-photo`} className="h-16 w-16 rounded-2xl border border-border/70">
            {event.speakerPhotoUrl ? (
              <AvatarImage src={event.speakerPhotoUrl} alt={event.speakerName} />
            ) : null}
            <AvatarFallback className="text-sm">{getInitials(event.speakerName)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
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
                <Users className="mr-1 h-3 w-3" />
                {event.attendeeCount} attendee{event.attendeeCount === 1 ? "" : "s"}
              </Badge>
            </div>
            <h3 className="font-display mt-3 text-2xl font-semibold leading-tight text-foreground">
              {event.name}
            </h3>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted">
              <CalendarDays className="h-4 w-4 shrink-0 text-accent" />
              <span>{formatEventDate(event.date)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="rounded-2xl border border-border/60 bg-background/35 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
            <UserRound className="h-3.5 w-3.5" />
            Speaker
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">{event.speakerName}</p>
          <p className="mt-1 text-sm text-muted">{event.speakerDesignation}</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Button variant="secondary" size="sm" onClick={() => onEdit(event)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onExportPdf(event)}>
            <FileDown className="h-3.5 w-3.5" />
            Export PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onUpdateStatus(event)}>
            Update Status
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onViewAttendees(event)}>
            <Users className="h-3.5 w-3.5" />
            View Attendees
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="col-span-2 sm:col-span-1"
            onClick={() => onDelete(event)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}
