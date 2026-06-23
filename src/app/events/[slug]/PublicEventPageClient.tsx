"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import {
  PublicEventSkeleton,
  PublicEventView
} from "@/components/events/PublicEventView";
import { PublicEventUnavailable } from "@/components/events/PublicEventUnavailable";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { PublicSiteFooter } from "@/components/layout/PublicSiteFooter";
import { Button } from "@/components/ui/button";
import {
  lookupPublicEvent,
  type PublicEventLookupResult
} from "@/lib/event-graphql";
import type { EventRecord, EventStatus } from "@/lib/types";

interface PublicEventPageClientProps {
  slug: string;
  initialLookup: PublicEventLookupResult;
}

export function PublicEventPageClient({
  slug,
  initialLookup
}: PublicEventPageClientProps): React.JSX.Element {
  const [event, setEvent] = useState<EventRecord | null>(initialLookup.event ?? null);
  const [lookupCode, setLookupCode] = useState(initialLookup.code);
  const [lookupStatus, setLookupStatus] = useState<EventStatus | null>(
    initialLookup.status ?? null
  );
  const [loading, setLoading] = useState(false);

  const loadEvent = useCallback(async (): Promise<void> => {
    if (!slug) {
      setLookupCode("NOT_FOUND");
      return;
    }

    setLoading(true);

    try {
      const lookup = await lookupPublicEvent(slug);
      setLookupCode(lookup.code);
      setLookupStatus(lookup.status ?? null);
      setEvent(lookup.event ?? null);
    } catch {
      setLookupCode("NOT_FOUND");
      setEvent(null);
      setLookupStatus(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  if (!loading && lookupCode !== "OK") {
    return <PublicEventUnavailable code={lookupCode} status={lookupStatus} slug={slug} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="noise-overlay absolute inset-0 opacity-[0.18]" />
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-teal/10 blur-3xl" />
      </div>

      <header className="relative border-b border-border/70 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <BrandLogo />
          <Button variant="secondary" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {loading ? (
          <PublicEventSkeleton />
        ) : event ? (
          <PublicEventView event={event} onRsvpSuccess={() => void loadEvent()} />
        ) : (
          <PublicEventUnavailable code="NOT_FOUND" slug={slug} />
        )}
      </main>

      <PublicSiteFooter />
    </div>
  );
}
