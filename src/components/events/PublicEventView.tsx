"use client";

import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  FileDown,
  MapPin,
  Sparkles,
  UserRound,
  Users
} from "lucide-react";
import { useMemo, useState } from "react";

import { PublicRsvpDialog } from "@/components/events/PublicRsvpDialog";
import { ShareEventMenu } from "@/components/events/ShareEventMenu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { exportEventPdf } from "@/lib/export-pdf";
import { getEventStatusClassName, getEventStatusLabel } from "@/lib/event-status";
import { formatEventDate, formatEventTime, getInitials } from "@/lib/format";
import type { EventRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { pushToast } from "@/store/toast.store";

interface PublicEventViewProps {
  event: EventRecord;
  onRsvpSuccess?: () => void;
}

function buildHighlights(description: string): string[] {
  const sentences = description
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 24);

  if (sentences.length >= 3) {
    return sentences.slice(0, 4);
  }

  return [
    "Evidence-based clinical updates from a leading specialist",
    "Practical protocols you can apply in your next shift or clinic",
    "Live Q&A and peer discussion with fellow clinicians",
    "Certificate-friendly session designed for busy medical teams"
  ];
}

function SpeakerCard({ event }: { event: EventRecord }): React.JSX.Element {
  const speakerIntro = event.aiSpeakerIntro?.trim();

  return (
    <section className="rounded-[1.5rem] border border-border/70 bg-surface/80 p-6 sm:p-7">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
        <UserRound className="h-3.5 w-3.5 text-teal" />
        Featured speaker
      </div>

      <div className="mt-6 flex items-start gap-5">
        <Avatar className="h-20 w-20 shrink-0 rounded-2xl border border-border/70 shadow-sm sm:h-24 sm:w-24">
          {event.speakerPhotoUrl ? (
            <AvatarImage src={event.speakerPhotoUrl} alt={event.speakerName} />
          ) : null}
          <AvatarFallback className="text-base font-medium sm:text-lg">
            {getInitials(event.speakerName)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 pt-1">
          <h2 className="text-lg font-semibold leading-tight text-foreground sm:text-xl">
            {event.speakerName}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{event.speakerDesignation}</p>
        </div>
      </div>

      {speakerIntro ? (
        <>
          <Separator className="my-6 bg-border/60" />
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted/80">
              About the speaker
            </p>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/90 sm:text-[0.95rem]">
              {speakerIntro}
            </p>
          </div>
        </>
      ) : null}
    </section>
  );
}

export function PublicEventView({ event, onRsvpSuccess }: PublicEventViewProps): React.JSX.Element {
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const description = event.aiDescription?.trim();
  const highlights = useMemo(
    () => buildHighlights(description ?? event.name),
    [description, event.name]
  );

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

  return (
    <>
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-surface/90 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.55)]">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.12] via-transparent to-teal/[0.08]" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-56 w-56 rounded-full bg-teal/10 blur-3xl" />

        <div className="relative border-b border-border/50 px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={cn(
                "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
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

          <h1 className="font-display mt-5 max-w-3xl text-3xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            {event.name}
          </h1>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2.5 rounded-2xl border border-border/60 bg-background/40 px-4 py-2.5 text-sm text-foreground sm:text-base">
              <CalendarDays className="h-4 w-4 shrink-0 text-accent" />
              <span>
                {formatEventDate(event.date)} · {formatEventTime(event.date)}
              </span>
            </div>
            <div className="inline-flex items-center gap-2.5 rounded-2xl border border-border/60 bg-background/40 px-4 py-2.5 text-sm text-muted">
              <MapPin className="h-4 w-4 shrink-0 text-teal" />
              <span>Virtual session · Onference Event Studio</span>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col gap-3 px-6 py-5 sm:flex-row sm:flex-wrap sm:items-center sm:px-10">
          <Button size="lg" className="w-full sm:w-auto" onClick={() => setRsvpOpen(true)}>
            Register interest
          </Button>
          <ShareEventMenu event={event} className="w-full sm:w-auto" />
          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => void handleExportPdf()}
            disabled={exporting}
          >
            <FileDown className="h-4 w-4" />
            {exporting ? "Exporting…" : "Export PDF"}
          </Button>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)] lg:items-start">
        <div className="space-y-6">
          {description ? (
            <section className="rounded-[1.5rem] border border-border/70 bg-surface/70 p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                About this event
              </div>
              <p className="mt-5 whitespace-pre-line text-[0.95rem] leading-[1.75] text-foreground/90 sm:text-base">
                {description}
              </p>
            </section>
          ) : (
            <section className="rounded-[1.5rem] border border-dashed border-border/70 bg-surface/40 px-6 py-10 text-center sm:px-8">
              <p className="text-sm text-muted">Full event details will be published soon.</p>
              <Button className="mt-5" onClick={() => setRsvpOpen(true)}>
                Register interest
              </Button>
            </section>
          )}

          <section className="rounded-[1.5rem] border border-border/70 bg-surface/70 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
              <BookOpen className="h-3.5 w-3.5 text-teal" />
              What you&apos;ll take away
            </div>
            <ul className="mt-5 space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/90 sm:text-[0.95rem]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[1.5rem] border border-border/70 bg-surface/70 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted">
              <Users className="h-3.5 w-3.5 text-accent" />
              Who should attend
            </div>
            <p className="mt-4 text-sm leading-relaxed text-foreground/90 sm:text-[0.95rem]">
              This session is designed for consultants, residents, nursing leads, and allied health
              professionals working in {event.speakerDesignation.toLowerCase().includes("medicine") ? "acute and specialist care" : "clinical practice"} who want
              practical updates from {event.speakerName}.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Whether you are building a departmental teaching plan or attending independently, you
              will leave with clear protocols, discussion points, and resources to share with your
              team.
            </p>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-6">
          <SpeakerCard event={event} />

          <section className="rounded-[1.5rem] border border-border/60 bg-background/30 p-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Event details</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Date</dt>
                <dd className="text-right font-medium text-foreground">{formatEventDate(event.date)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Format</dt>
                <dd className="text-right font-medium text-foreground">Live virtual session</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Registrations</dt>
                <dd className="text-right font-medium text-foreground">{event.attendeeCount} clinicians</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Hosted by</dt>
                <dd className="text-right font-medium text-foreground">Onference Event Studio</dd>
              </div>
            </dl>
            <Button className="mt-5 w-full" onClick={() => setRsvpOpen(true)}>
              Reserve your seat
            </Button>
          </section>
        </aside>
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
      <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-surface/50">
        <div className="border-b border-border/50 px-6 py-10 sm:px-10">
          <div className="h-6 w-28 rounded-full bg-background" />
          <div className="mt-5 h-12 w-4/5 max-w-2xl rounded-2xl bg-background" />
          <div className="mt-5 h-11 w-56 rounded-2xl bg-background" />
        </div>
        <div className="flex gap-3 px-6 py-5 sm:px-10">
          <div className="h-12 w-40 rounded-2xl bg-background" />
          <div className="h-12 w-28 rounded-2xl bg-background" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
        <div className="h-64 rounded-[1.5rem] border border-border/70 bg-surface/50" />
        <div className="h-80 rounded-[1.5rem] border border-border/70 bg-surface/50" />
      </div>
    </div>
  );
}
