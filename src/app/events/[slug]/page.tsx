import { PublicEventPageClient } from "@/app/events/[slug]/PublicEventPageClient";
import { lookupPublicEvent } from "@/lib/event-graphql";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublicEventPage({
  params
}: PageProps): Promise<React.JSX.Element> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug ?? "");
  const initialLookup = slug
    ? await lookupPublicEvent(slug)
    : { code: "NOT_FOUND" as const, event: null, status: null };

  return <PublicEventPageClient slug={slug} initialLookup={initialLookup} />;
}
