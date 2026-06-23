export function slugifyEventName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function getPublicEventPath(event: { slug?: string; name: string; id: string }): string {
  const slug = event.slug?.trim() || slugifyEventName(event.name) || event.id;
  return `/events/${slug}`;
}

export function getPublicEventUrl(event: { slug?: string; name: string; id: string }): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${getPublicEventPath(event)}`;
}
