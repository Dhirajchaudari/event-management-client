import { CalendarPlus } from "lucide-react";

interface EmptyStateProps {
  onCreate: () => void;
}

export function EmptyState({ onCreate }: EmptyStateProps): React.JSX.Element {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-dashed border-border/80 bg-surface/40 px-6 py-16 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(232,165,75,0.12),transparent_55%)]" />
      <div className="relative mx-auto max-w-md">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-accent/25 bg-accent/10">
          <CalendarPlus className="h-7 w-7 text-accent" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-foreground">No events yet</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Start curating your conference lineup. Add speakers, dates, and sessions in a polished
          timeline your team can manage together.
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-medium text-accent-foreground shadow-[0_12px_40px_-12px_rgba(232,165,75,0.65)] transition hover:brightness-110"
        >
          Create your first event
        </button>
      </div>
    </div>
  );
}
