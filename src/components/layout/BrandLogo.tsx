import { CalendarDays } from "lucide-react";

import { cn } from "@/lib/utils";

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
}

export function BrandLogo({ compact = false, className }: BrandLogoProps): React.JSX.Element {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/20 via-surface to-teal/10 shadow-[0_10px_30px_-12px_rgba(232,165,75,0.55)]">
        <CalendarDays className="h-5 w-5 text-accent" />
        <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-teal shadow-[0_0_12px_rgba(94,234,212,0.8)]" />
      </div>
      {!compact && (
        <div>
          <p className="font-display text-lg font-semibold tracking-tight text-foreground">
            Onference
          </p>
          <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Event Studio</p>
        </div>
      )}
    </div>
  );
}
