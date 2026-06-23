import Link from "next/link";
import { Clock3, FileQuestion, ShieldAlert } from "lucide-react";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { PublicSiteFooter } from "@/components/layout/PublicSiteFooter";
import { Button } from "@/components/ui/button";
import { getEventStatusLabel } from "@/lib/event-status";
import type { PublicEventLookupCode } from "@/lib/event-graphql";
import type { EventStatus } from "@/lib/types";

interface PublicEventUnavailableProps {
  code: PublicEventLookupCode;
  status?: EventStatus | null;
  slug?: string;
}

const COPY: Record<
  Exclude<PublicEventLookupCode, "OK">,
  { icon: typeof FileQuestion; title: string; description: string }
> = {
  NOT_FOUND: {
    icon: FileQuestion,
    title: "Event not found",
    description:
      "We could not find an event at this address. The link may be outdated or the event may have been removed."
  },
  NOT_PUBLISHED: {
    icon: Clock3,
    title: "Event not published yet",
    description:
      "This event exists but is not live on the public site yet. Once an admin approves and publishes it, this page will become available."
  },
  PENDING_APPROVAL: {
    icon: ShieldAlert,
    title: "Awaiting admin approval",
    description:
      "The organizer has submitted this event for review. It will appear here after an admin approves and publishes it."
  }
};

export function PublicEventUnavailable({
  code,
  status,
  slug
}: PublicEventUnavailableProps): React.JSX.Element {
  if (code === "OK") {
    return <></>;
  }

  const meta = COPY[code];
  const Icon = meta.icon;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/70 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <BrandLogo />
          <Button variant="secondary" size="sm" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/70 bg-surface/70">
          <Icon className="h-6 w-6 text-accent" />
        </div>
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-accent">
          {code === "NOT_FOUND" ? "404" : "Unavailable"}
        </p>
        <h1 className="font-display mt-3 text-3xl font-semibold text-foreground">{meta.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{meta.description}</p>
        {status ? (
          <p className="mt-4 rounded-full border border-border/70 bg-surface/60 px-3 py-1 text-xs text-muted">
            Current status: <span className="text-foreground">{getEventStatusLabel(status)}</span>
          </p>
        ) : null}
        {slug ? (
          <p className="mt-3 break-all text-xs text-muted/80">{slug}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/login">Organizer / admin login</Link>
          </Button>
        </div>
      </main>

      <PublicSiteFooter />
    </div>
  );
}
