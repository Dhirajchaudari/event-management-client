"use client";

import { FilterX } from "lucide-react";

import { Button } from "@/components/ui/button";

interface FilteredEmptyStateProps {
  onClearFilters: () => void;
}

export function FilteredEmptyState({ onClearFilters }: FilteredEmptyStateProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-border/70 bg-surface/50 px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-background/40 text-muted">
        <FilterX className="h-5 w-5" />
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground">No events match your filters</h3>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Try adjusting your search or filter criteria to find events in your lineup.
      </p>
      <Button variant="secondary" className="mt-6" onClick={onClearFilters}>
        Clear filters
      </Button>
    </div>
  );
}
