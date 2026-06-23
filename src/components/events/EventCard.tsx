"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  CalendarDays,
  CircleDot,
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
import { formatEventDate, getInitials } from "@/lib/format";
import { getEventStatusClassName, getEventStatusLabel } from "@/lib/event-status";
import type { EventRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: EventRecord;
  className?: string;
  featured?: boolean;
  onEdit: (event: EventRecord) => void;
  onDelete: (event: EventRecord) => void;
  onExportPdf: (event: EventRecord) => void;
  onUpdateStatus: (event: EventRecord) => void;
  onViewAttendees: (event: EventRecord) => void;
}

export function EventCard({
  event,
  className,
  featured = false,
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
        "hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_24px_60px_-30px_rgba(232,165,75,0.45)]",
        className
      )}
    >
      <div className="border-b border-border/60 bg-background/30 p-5">
        <div className="flex items-start gap-4">
          <Avatar
            key={event.speakerPhotoUrl || `${event.id}-no-photo`}
            className={cn(
              "shrink-0 rounded-2xl border border-border/70",
              featured ? "h-20 w-20" : "h-16 w-16"
            )}
          >
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
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <h3
                className={cn(
                  "font-display font-semibold leading-tight text-foreground",
                  featured ? "text-2xl lg:text-3xl" : "text-xl lg:text-2xl"
                )}
              >
                {event.name}
              </h3>
              <Badge variant="muted" className="normal-case tracking-normal">
                <Users className="mr-1 h-3 w-3" />
                {event.attendeeCount}
              </Badge>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted">
              <CalendarDays className="h-4 w-4 shrink-0 text-accent" />
              <span>{formatEventDate(event.date)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {featured && event.aiDescription ? (
          <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted">{event.aiDescription}</p>
        ) : null}

        <div className="rounded-2xl border border-border/60 bg-background/35 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
            <UserRound className="h-3.5 w-3.5" />
            Speaker
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">{event.speakerName}</p>
          <p className="mt-1 text-sm text-muted">{event.speakerDesignation}</p>
        </div>

        <div className="mt-auto flex items-center gap-2 pt-5">
          <Button variant="secondary" size="sm" className="flex-1" onClick={() => onEdit(event)}>
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
      </div>
    </article>
  );
}
