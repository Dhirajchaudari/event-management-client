"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  CalendarDays,
  CalendarPlus,
  ChevronRight,
  CircleDot,
  ExternalLink,
  FileDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserRound,
  Users
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCreatedDate, formatEventDate, getInitials } from "@/lib/format";
import type { BentoLayout } from "@/lib/event-bento";
import { getEventStatusClassName, getEventStatusLabel } from "@/lib/event-status";
import type { EventRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: EventRecord;
  layout?: BentoLayout;
  className?: string;
  onEdit: (event: EventRecord) => void;
  onDelete: (event: EventRecord) => void;
  onExportPdf: (event: EventRecord) => void;
  onUpdateStatus: (event: EventRecord) => void;
  onViewAttendees: (event: EventRecord) => void;
}

function EventStatusPill({ status }: { status: EventRecord["status"] }): React.JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        getEventStatusClassName(status)
      )}
    >
      {getEventStatusLabel(status)}
    </span>
  );
}

function EventCardActions({
  event,
  onEdit,
  onDelete,
  onExportPdf,
  onUpdateStatus,
  onViewAttendees,
  className
}: Pick<
  EventCardProps,
  "event" | "onEdit" | "onDelete" | "onExportPdf" | "onUpdateStatus" | "onViewAttendees"
> & { className?: string }): React.JSX.Element {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button variant="secondary" size="icon" asChild>
        <a
          href={`/events/${event.id}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View public page for ${event.name}`}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </Button>

      <Button variant="secondary" size="sm" className="flex-1 sm:flex-none" onClick={() => onEdit(event)}>
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </Button>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="secondary" size="icon" aria-label={`More actions for ${event.name}`}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="z-50 min-w-[11rem] rounded-2xl border border-border/80 bg-surface p-1.5 shadow-xl"
          >
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground outline-none hover:bg-background"
              onSelect={() => {
                window.open(`/events/${event.id}`, "_blank", "noopener,noreferrer");
              }}
            >
              <ExternalLink className="h-4 w-4 text-muted" />
              View public page
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground outline-none hover:bg-background"
              onSelect={() => onExportPdf(event)}
            >
              <FileDown className="h-4 w-4 text-muted" />
              Export PDF
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground outline-none hover:bg-background"
              onSelect={() => onUpdateStatus(event)}
            >
              <CircleDot className="h-4 w-4 text-muted" />
              Update status
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground outline-none hover:bg-background"
              onSelect={() => onViewAttendees(event)}
            >
              <Users className="h-4 w-4 text-muted" />
              View attendees
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1 h-px bg-border/70" />
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-danger outline-none hover:bg-danger/10"
              onSelect={() => onDelete(event)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}

function EventDates({ event, inline = false }: { event: EventRecord; inline?: boolean }): React.JSX.Element {
  if (inline) {
    return (
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-accent" />
          {formatEventDate(event.date)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarPlus className="h-3.5 w-3.5 text-teal" />
          Created {formatCreatedDate(event.createdAt)}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-1.5 text-sm text-muted">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 shrink-0 text-accent" />
        <span>
          Event: <span className="text-foreground">{formatEventDate(event.date)}</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <CalendarPlus className="h-4 w-4 shrink-0 text-teal" />
        <span>
          Created: <span className="text-foreground">{formatCreatedDate(event.createdAt)}</span>
        </span>
      </div>
    </div>
  );
}

function AttendeeSummary({
  event,
  onViewAttendees
}: {
  event: EventRecord;
  onViewAttendees: (event: EventRecord) => void;
}): React.JSX.Element {
  const attendees = event.attendees ?? [];
  const preview = attendees.slice(0, 3);

  return (
    <button
      type="button"
      onClick={() => onViewAttendees(event)}
      className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-background/35 px-4 py-3 text-left transition hover:border-accent/40 hover:bg-background/50"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
        <Users className="h-4 w-4 text-accent" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">
          {event.attendeeCount} RSVP{event.attendeeCount === 1 ? "" : "s"}
        </p>
        <p className="truncate text-xs text-muted">
          {event.attendeeCount === 0
            ? "No registrations yet"
            : preview.map((attendee) => attendee.name.split(" ").pop()).join(", ") +
              (event.attendeeCount > preview.length ? ` +${event.attendeeCount - preview.length}` : "")}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {preview.length > 0 ? (
          <div className="flex -space-x-2">
            {preview.map((attendee) => (
              <span
                key={attendee.id}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-[10px] font-medium text-foreground"
              >
                {getInitials(attendee.name)}
              </span>
            ))}
          </div>
        ) : null}
        <ChevronRight className="h-4 w-4 text-muted" />
      </div>
    </button>
  );
}

function SpeakerBlock({
  event,
  showIntro = false,
  className
}: {
  event: EventRecord;
  showIntro?: boolean;
  className?: string;
}): React.JSX.Element {
  const intro = event.aiSpeakerIntro?.trim();

  return (
    <div className={cn("rounded-2xl border border-border/60 bg-background/35 px-4 py-3", className)}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
        <UserRound className="h-3.5 w-3.5" />
        Speaker
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{event.speakerName}</p>
      <p className="mt-1 text-sm text-muted">{event.speakerDesignation}</p>
      {showIntro && intro ? (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{intro}</p>
      ) : null}
    </div>
  );
}

function EventCardHeader({
  event,
  large = false
}: {
  event: EventRecord;
  large?: boolean;
}): React.JSX.Element {
  return (
    <div className="flex items-start gap-4">
      <Avatar
        key={event.speakerPhotoUrl || `${event.id}-no-photo`}
        className={cn(
          "shrink-0 rounded-2xl border border-border/70",
          large ? "h-20 w-20" : "h-16 w-16"
        )}
      >
        {event.speakerPhotoUrl ? (
          <AvatarImage src={event.speakerPhotoUrl} alt={event.speakerName} />
        ) : null}
        <AvatarFallback className="text-sm">{getInitials(event.speakerName)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <EventStatusPill status={event.status} />
          <Badge variant="muted" className="normal-case tracking-normal">
            <Users className="mr-1 h-3 w-3" />
            {event.attendeeCount} RSVP{event.attendeeCount === 1 ? "" : "s"}
          </Badge>
        </div>
        <h3
          className={cn(
            "font-display mt-3 font-semibold leading-tight text-foreground",
            large ? "text-2xl lg:text-3xl" : "text-xl lg:text-2xl"
          )}
        >
          {event.name}
        </h3>
        <EventDates event={event} inline={large} />
      </div>
    </div>
  );
}

export function EventCard({
  event,
  layout = "default",
  className,
  onEdit,
  onDelete,
  onExportPdf,
  onUpdateStatus,
  onViewAttendees
}: EventCardProps): React.JSX.Element {
  const description = event.aiDescription?.trim();
  const isHero = layout === "hero";

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface/70 backdrop-blur-sm transition duration-300",
        "hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_24px_60px_-30px_rgba(232,165,75,0.45)]",
        className
      )}
    >
      <div className="border-b border-border/60 bg-background/30 p-5">
        <EventCardHeader event={event} large={isHero} />
      </div>

      <div className="flex flex-col gap-4 p-5">
        {description ? (
          <p
            className={cn(
              "text-sm leading-relaxed text-muted",
              isHero ? "line-clamp-3" : "line-clamp-2"
            )}
          >
            {description}
          </p>
        ) : null}

        <div className={cn("grid gap-4", isHero && "sm:grid-cols-2")}>
          <SpeakerBlock event={event} showIntro={isHero} />
          <AttendeeSummary event={event} onViewAttendees={onViewAttendees} />
        </div>

        <EventCardActions
          event={event}
          onEdit={onEdit}
          onDelete={onDelete}
          onExportPdf={onExportPdf}
          onUpdateStatus={onUpdateStatus}
          onViewAttendees={onViewAttendees}
          className="pt-1"
        />
      </div>
    </article>
  );
}
