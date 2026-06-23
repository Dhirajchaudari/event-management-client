import Link from "next/link";

import { BrandLogo } from "@/components/layout/BrandLogo";

export function PublicSiteFooter(): React.JSX.Element {
  return (
    <footer className="mt-16 border-t border-border/70 bg-surface/40">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <BrandLogo compact />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Onference Event Studio helps clinical teams publish CME sessions, manage speakers,
              and grow attendance with polished public event pages.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="font-medium text-foreground">Platform</p>
              <ul className="mt-3 space-y-2 text-muted">
                <li>
                  <Link href="/login" className="transition hover:text-foreground">
                    Organizer login
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="transition hover:text-foreground">
                    Attendee login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-foreground">Resources</p>
              <ul className="mt-3 space-y-2 text-muted">
                <li>
                  <a href="/sitemap.xml" className="transition hover:text-foreground">
                    Sitemap
                  </a>
                </li>
                <li>
                  <a href="/robots.txt" className="transition hover:text-foreground">
                    Robots.txt
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="font-medium text-foreground">Contact</p>
              <p className="mt-3 text-muted">events@orbitalops.net</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border/60 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Onference Event Studio. All rights reserved.</p>
          <p>Built for modern medical conference teams.</p>
        </div>
      </div>
    </footer>
  );
}
