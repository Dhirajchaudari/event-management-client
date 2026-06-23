import type { Metadata } from "next";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://events.orbitalops.net";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { slug } = await params;
  const title = `${slug.replace(/-/g, " ")} | Onference Event Studio`;

  return {
    title,
    alternates: {
      canonical: `${SITE_URL}/events/${slug}`
    }
  };
}

export default function PublicEventLayout({ children }: LayoutProps): React.ReactNode {
  return children;
}
