import * as React from "react";
import { CalendarDays } from "lucide-react";

import { cn } from "@/lib/utils";

export const DateInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <div className="relative">
      <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
      <input
        ref={ref}
        type="date"
        className={cn(
          "date-input flex h-11 w-full rounded-xl border border-border/80 bg-background/60 py-2 pl-11 pr-4 text-sm text-foreground shadow-inner shadow-black/10 transition-colors",
          "focus-visible:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
);
DateInput.displayName = "DateInput";
