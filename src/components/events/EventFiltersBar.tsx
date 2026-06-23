"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  DATE_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  type DateFilter,
  type StatusFilter
} from "@/lib/event-filters";
import { cn } from "@/lib/utils";

interface EventFiltersBarProps {
  search: string;
  status: StatusFilter;
  date: DateFilter;
  filteredCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onDateChange: (value: DateFilter) => void;
}

const selectClassName = cn(
  "h-11 w-full rounded-xl border border-border/80 bg-background/60 px-4 text-sm text-foreground shadow-inner shadow-black/10 transition-colors",
  "focus-visible:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20"
);

export function EventFiltersBar({
  search,
  status,
  date,
  filteredCount,
  totalCount,
  onSearchChange,
  onStatusChange,
  onDateChange
}: EventFiltersBarProps): React.JSX.Element {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by event or speaker name..."
            className="pl-11"
            aria-label="Search events"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[26rem]">
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
            className={selectClassName}
            aria-label="Filter by status"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={date}
            onChange={(event) => onDateChange(event.target.value as DateFilter)}
            className={selectClassName}
            aria-label="Filter by date"
          >
            {DATE_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-muted">
        Showing <span className="font-medium text-foreground">{filteredCount}</span> of{" "}
        <span className="font-medium text-foreground">{totalCount}</span> events
      </p>
    </div>
  );
}
