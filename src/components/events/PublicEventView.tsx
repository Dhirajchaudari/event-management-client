"use client";

import {
  CalendarDays,
  FileDown,
  Share2,
  Sparkles,
  UserRound,
  Users
} from "lucide-react";
import { useState } from "react";

import { PublicRsvpDialog } from "@/components/events/PublicRsvpDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exportEventPdf } from "@/lib/export-pdf";
import { getEventStatusClassName, getEventStatusLabel } from "@/lib/event-status";
import { formatEventDate, getInitials } from "@/lib/format";
import type { EventRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { pushToast } from "@/store/toast.store";

interface PublicEventViewProps {
  event: EventRecord;
  onRsvpSuccess?: () => void;
}

export function PublicEventView({ event, onRsvpSuccess }: PublicEventViewProps): React.JSX.Element {
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const description = event.aiDescription?.trim();
  const speakerIntro = event.aiSpeakerIntro?.trim();

  async function handleExportPdf(): Promise<void> {
    setExporting(true);
    try {
      await exportEventPdf(event);
      pushToast("PDF downloaded", "success");
    } catch {
      pushToast("Failed to export PDF", "error");
    } finally {
      setExporting(false);
    }
  }

  async function handleShare(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href);
      pushToast("Event link copied to clipboard", "success");
    } catch {
      pushToast("Could not copy link", "error");
    }
  }

  return (
    <>
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-surface/80">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-teal/10" />
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-teal/10 blur-3xl" />

        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={cn(
                "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                getEventStatusClassName(event.status)
              )}
            >
              {getEventStatusLabel(event.status)}
            </span>
            <Badge variant="muted" className="normal-case tracking-normal">
              <Users className="mr-1 h-3.5 w-3.5" />
              {event.attendeeCount} registered
            </Badge>
          </div>

          <h1 className="font-display mt-5 max-w-4xl text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            {event.name}
          </h1>

          <div className="mt-4 flex items-center gap-2 text-muted">
            <CalendarDays className="h-5 w-5 text-accent" />
            <span className="text-base sm:text-lg">{formatEventDate(event.date)}</span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => setRsvpOpen(true)}>
              Register interest
            </Button>
            <Button variant="secondary" size="lg" onClick={() => void handleShare()}>
              <Share2 className="h-4 w-4" />
              Share event
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => void handleExportPdf()}
              disabled={exporting}
            >
              <FileDown className="h-4 w-4" />
              {exporting ? "Exporting…" : "Export PDF"}
            </Button>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <aside className="space-y-6">
          <div className="rounded-[1.5rem] border border-border/70 bg-surface/70 p-6">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
              <UserRound className="h-3.5 w-3.5" />
              Speaker
            </div>

            <div className="mt-5 flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
              <Avatar className="h-24 w-24 shrink-0 rounded-2xl border border-border/70">
                {event.speakerPhotoUrl ? (
                  <AvatarImage src={event.speakerPhotoUrl} alt={event.speakerName} />
                ) : null}
                <AvatarFallback className="text-lg">{getInitials(event.speakerName)}</AvatarFallback>
              </Avatar>

              <div className="mt-4 sm:mt-0 sm:ml-5">
                <p className="text-lg font-semibold text-foreground">{event.speakerName}</p>
                <p className="mt-1 text-sm text-muted">{event.speakerDesignation}</p>
              </div>
            </div>

            {speakerIntro ? (
              <p className="mt-5 line-clamp-4 text-sm leading-relaxed text-muted lg:hidden">
                {speakerIntro}
              </p>
            ) : null}
          </div>
        </aside>

        <div className="space-y-6">
          {description ? (
            <section className="rounded-[1.5rem] border border-border/70 bg-surface/70 p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                About this event
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/90 sm:text-base">
                {description}
              </p>
            </section>
          ) : null}

          {speakerIntro ? (
            <section className="rounded-[1.5rem] border border-border/70 bg-surface/70 p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
                <UserRound className="h-3.5 w-3.5 text-teal" />
                Speaker introduction
              </div>
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/90 sm:text-base">
                {speakerIntro}
              </p>
            </section>
          ) : null}

          {!description && !speakerIntro ? (
            <section className="rounded-[1.5rem] border border-dashed border-border/70 bg-surface/40 p-8 text-center">
              <p className="text-sm text-muted">Event details will be published soon.</p>
            </section>
          ) : null}
        </div>
      </div>

      <PublicRsvpDialog
        event={event}
        open={rsvpOpen}
        onOpenChange={setRsvpOpen}
        onSuccess={onRsvpSuccess}
      />
    </>
  );
}

export function PublicEventSkeleton(): React.JSX.Element {
  return (
    <div className="animate-pulse space-y-8">
      <div className="rounded-[2rem] border border-border/70 bg-surface/50 px-6 py-14 sm:px-10">
        <div className="h-6 w-24 rounded-full bg-background" />
        <div className="mt-5 h-12 w-3/4 max-w-2xl rounded-2xl bg-background" />
        <div className="mt-4 h-5 w-48 rounded-xl bg-background" />
        <div className="mt-8 flex gap-3">
          <div className="h-11 w-36 rounded-2xl bg-background" />
          <div className="h-11 w-32 rounded-2xl bg-background" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="h-72 rounded-[1.5rem] border border-border/70 bg-surface/50" />
        <div className="h-72 rounded-[1.5rem] border border-border/70 bg-surface/50" />
      </div>
    </div>
  );
}
