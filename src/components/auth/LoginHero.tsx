import { Sparkles } from "lucide-react";

import { BrandLogo } from "@/components/layout/BrandLogo";

export function LoginHero(): React.JSX.Element {
  return (
    <aside className="relative hidden min-h-full overflow-hidden border-r border-border/60 bg-surface/40 lg:flex lg:w-[48%]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(232,165,75,0.22),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(94,234,212,0.18),transparent_35%),linear-gradient(160deg,#0d0d14,#12121c)]" />
      <div className="noise-overlay absolute inset-0 opacity-30" />
      <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">
        <BrandLogo />
        <div className="max-w-lg">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            Curated conference ops
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foreground xl:text-6xl">
            Design events people remember.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">
            Plan speakers, sessions, and timelines in a workspace built for modern conference teams —
            fast, focused, and beautifully organized.
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.24em] text-muted/80">
          OnferenceTV · Event Management
        </p>
      </div>
    </aside>
  );
}
