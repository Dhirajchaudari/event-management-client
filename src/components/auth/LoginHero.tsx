import { CalendarDays, ShieldCheck, Users } from "lucide-react";

import { BrandLogo } from "@/components/layout/BrandLogo";

const HIGHLIGHTS = [
  {
    icon: CalendarDays,
    title: "Plan with clarity",
    description: "Organizers submit events, admins approve, and public pages go live with SEO-friendly URLs."
  },
  {
    icon: Users,
    title: "Grow attendance",
    description: "Attendees register interest, track sessions, and return to polished public event pages."
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    description: "Separate workspaces for organizers, attendees, and admins — each with the right level of control."
  }
];

export function LoginHero(): React.JSX.Element {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden lg:flex lg:flex-col">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(232,165,75,0.24),transparent_42%),radial-gradient(circle_at_82%_12%,rgba(94,234,212,0.2),transparent_36%),linear-gradient(165deg,#0b0b12_0%,#11111b_48%,#0d0d14_100%)]" />
      <div className="noise-overlay absolute inset-0 opacity-30" />
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-border/80 to-transparent" />

      <div className="relative flex min-h-screen flex-col justify-between p-10 xl:p-14">
        <BrandLogo />

        <div className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent">
            Onference Event Studio
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-tight text-foreground xl:text-[3.4rem]">
            The modern way to run medical conferences.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">
            Publish speaker-led sessions, manage approvals, and give attendees a premium
            experience from login to registration.
          </p>

          <div className="mt-10 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 rounded-2xl border border-border/50 bg-background/20 px-4 py-4 backdrop-blur-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
                  <Icon className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs uppercase tracking-[0.24em] text-muted/80">
          Trusted by conference teams · OnferenceTV
        </p>
      </div>
    </aside>
  );
}
