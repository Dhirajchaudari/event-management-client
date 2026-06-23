"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  CalendarDays,
  CircleDot,
  FileDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users
} from "lucide-react";

import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatEventDate, getInitials } from "@/lib/format";
import type { EventRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EventTableProps {
  events: EventRecord[];
  onEdit: (event: EventRecord) => void;
  onDelete: (event: EventRecord) => void;
  onExportPdf: (event: EventRecord) => void;
  onUpdateStatus: (event: EventRecord) => void;
  onViewAttendees: (event: EventRecord) => void;
}

export function EventTable({
  events,
  onEdit,
  onDelete,
  onExportPdf,
  onUpdateStatus,
  onViewAttendees
}: EventTableProps): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface/70 backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-background/30 text-xs font-medium uppercase tracking-[0.14em] text-muted">
              <th className="px-5 py-4 font-medium">Event</th>
              <th className="px-5 py-4 font-medium">Date</th>
              <th className="px-5 py-4 font-medium">Speaker</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium">Attendees</th>
              <th className="px-5 py-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr
                key={event.id}
                className="border-b border-border/50 transition hover:bg-background/20 last:border-b-0"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar
                      key={event.speakerPhotoUrl || `${event.id}-no-photo`}
                      className="h-10 w-10 rounded-xl border border-border/70"
                    >
                      {event.speakerPhotoUrl ? (
                        <AvatarImage src={event.speakerPhotoUrl} alt={event.speakerName} />
                      ) : null}
                      <AvatarFallback className="text-xs">{getInitials(event.speakerName)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{event.name}</p>
                      <p className="truncate text-xs text-muted">{event.speakerDesignation}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-muted">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 shrink-0 text-accent" />
                    <span>{formatEventDate(event.date)}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-foreground">{event.speakerName}</td>
                <td className="px-5 py-4">
                  <EventStatusBadge status={event.status} />
                </td>
                <td className="px-5 py-4 text-muted">
                  {event.attendeeCount} attendee{event.attendeeCount === 1 ? "" : "s"}
                </td>
                <td className="px-5 py-4 text-right">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button variant="secondary" size="icon" aria-label={`Actions for ${event.name}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        align="end"
                        sideOffset={8}
                        className={cn(
                          "z-50 min-w-[11rem] rounded-2xl border border-border/80 bg-surface p-1.5 shadow-xl"
                        )}
                      >
                        <DropdownMenu.Item
                          className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground outline-none hover:bg-background"
                          onSelect={() => onEdit(event)}
                        >
                          <Pencil className="h-4 w-4 text-muted" />
                          Edit
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
                          Update Status
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground outline-none hover:bg-background"
                          onSelect={() => onViewAttendees(event)}
                        >
                          <Users className="h-4 w-4 text-muted" />
                          View Attendees
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
