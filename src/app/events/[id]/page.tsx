"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  PublicEventSkeleton,
  PublicEventView
} from "@/components/events/PublicEventView";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Button } from "@/components/ui/button";
import { fetchPublicEvent } from "@/lib/event-graphql";
import type { EventRecord } from "@/lib/types";

export default function PublicEventPage(): React.JSX.Element {
  const params = useParams<{ id: string }>();
  const eventId = params.id;

  const [event, setEvent] = useState<EventRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  const loadEvent = useCallback(async (): Promise<void> => {
    if (!eventId) {
      setNotFoundState(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFoundState(false);

    try {
      const record = await fetchPublicEvent(eventId);
      if (!record) {
        setNotFoundState(true);
        setEvent(null);
        return;
      }
      setEvent(record);
    } catch {
      setNotFoundState(true);
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  if (!loading && notFoundState) {
    notFound();
  }

  function handleRsvpSuccess(): void {
    setEvent((current) =>
      current ? { ...current, attendeeCount: current.attendeeCount + 1 } : current
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="noise-overlay absolute inset-0 opacity-[0.18]" />
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-teal/10 blur-3xl" />
      </div>

      <header className="relative border-b border-border/70 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <BrandLogo />
          <Button variant="secondary" size="sm" asChild>
            <Link href="/login">Organizer login</Link>
          </Button>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {loading ? (
          <PublicEventSkeleton />
        ) : event ? (
          <PublicEventView event={event} onRsvpSuccess={handleRsvpSuccess} />
        ) : null}
      </main>
    </div>
  );
}
