"use client";

import { Search } from "lucide-react";

import { FilterSelect } from "@/components/ui/filter-select";
import { Input } from "@/components/ui/input";
import {
  DATE_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
  type DateFilter,
  type StatusFilter
} from "@/lib/event-filters";

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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[28rem]">
          <FilterSelect
            value={status}
            options={STATUS_FILTER_OPTIONS}
            onValueChange={onStatusChange}
            ariaLabel="Filter by status"
            className="w-full sm:min-w-[13rem]"
          />
          <FilterSelect
            value={date}
            options={DATE_FILTER_OPTIONS}
            onValueChange={onDateChange}
            ariaLabel="Filter by date"
            className="w-full sm:min-w-[13rem]"
          />
        </div>
      </div>

      <p className="text-sm text-muted">
        Showing <span className="font-medium text-foreground">{filteredCount}</span> of{" "}
        <span className="font-medium text-foreground">{totalCount}</span> events
      </p>
    </div>
  );
}
