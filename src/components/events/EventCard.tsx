"use client";

import { Mic2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatEventDate, getInitials } from "@/lib/format";
import type { EventRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: EventRecord;
  onEdit: (event: EventRecord) => void;
  onDelete: (event: EventRecord) => void;
}

export function EventCard({ event, onEdit, onDelete }: EventCardProps): React.JSX.Element {
  const eventDate = new Date(event.date);
  const day = eventDate.getDate();
  const month = eventDate.toLocaleString("en-IN", { month: "short" }).toUpperCase();

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-surface/70 p-5 backdrop-blur-sm transition duration-300",
        "hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-[0_24px_60px_-30px_rgba(232,165,75,0.45)]"
      )}
    >
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-accent via-teal to-transparent opacity-80" />
      <div className="flex items-start gap-4">
        <div className="flex min-w-[72px] flex-col items-center rounded-2xl border border-border/70 bg-background/50 px-3 py-3">
          <span className="text-[11px] font-semibold tracking-[0.18em] text-accent">{month}</span>
          <span className="font-display text-3xl font-semibold leading-none text-foreground">{day}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display truncate text-xl font-semibold text-foreground">{event.name}</h3>
              <p className="mt-1 text-sm text-muted">{formatEventDate(event.date)}</p>
            </div>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0 opacity-70 group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={6}
                  className="z-50 min-w-[160px] rounded-2xl border border-border/80 bg-surface p-1.5 shadow-xl"
                >
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm outline-none hover:bg-background"
                    onSelect={() => onEdit(event)}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </DropdownMenu.Item>
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

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/35 px-3 py-3">
            <Avatar className="h-10 w-10 rounded-2xl">
              <AvatarFallback>{getInitials(event.speakerName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Mic2 className="h-3.5 w-3.5 text-teal" />
                <p className="truncate text-sm font-medium text-foreground">{event.speakerName}</p>
              </div>
              <p className="truncate text-xs text-muted">{event.speakerDesignation}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
