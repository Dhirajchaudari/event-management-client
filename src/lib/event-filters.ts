import { getEventStatusLabel } from "@/lib/event-status";
import { EVENT_STATUSES, type EventRecord, type EventStatus } from "@/lib/types";

export type StatusFilter = "all" | EventStatus;
export type DateFilter = "all" | "this-week" | "this-month" | "upcoming" | "past";

export const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  ...EVENT_STATUSES.map((status) => ({
    value: status,
    label: getEventStatusLabel(status)
  }))
];

export const DATE_FILTER_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "this-week", label: "This week" },
  { value: "this-month", label: "This month" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" }
];

const DATE_FILTERS: DateFilter[] = ["all", "this-week", "this-month", "upcoming", "past"];

export function parseStatusFilter(value: string | null): StatusFilter {
  if (!value || value === "all") {
    return "all";
  }
  if (EVENT_STATUSES.includes(value as EventStatus)) {
    return value as EventStatus;
  }
  return "all";
}

export function parseDateFilter(value: string | null): DateFilter {
  if (!value || value === "all") {
    return "all";
  }
  if (DATE_FILTERS.includes(value as DateFilter)) {
    return value as DateFilter;
  }
  return "all";
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function startOfWeek(date: Date): Date {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  return next;
}

function endOfWeek(date: Date): Date {
  const next = startOfWeek(date);
  next.setDate(next.getDate() + 6);
  return endOfDay(next);
}

function startOfMonth(date: Date): Date {
  return startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
}

function endOfMonth(date: Date): Date {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function matchesDateFilter(
  eventDateIso: string,
  filter: DateFilter,
  now: Date = new Date()
): boolean {
  if (filter === "all") {
    return true;
  }

  const eventDate = new Date(eventDateIso);
  const todayStart = startOfDay(now);

  switch (filter) {
    case "upcoming":
      return eventDate >= todayStart;
    case "past":
      return eventDate < todayStart;
    case "this-week":
      return eventDate >= startOfWeek(now) && eventDate <= endOfWeek(now);
    case "this-month":
      return eventDate >= startOfMonth(now) && eventDate <= endOfMonth(now);
    default:
      return true;
  }
}

export function filterEvents(
  events: EventRecord[],
  search: string,
  status: StatusFilter,
  date: DateFilter
): EventRecord[] {
  const query = search.trim().toLowerCase();

  return events.filter((event) => {
    if (status !== "all" && event.status !== status) {
      return false;
    }

    if (!matchesDateFilter(event.date, date)) {
      return false;
    }

    if (!query) {
      return true;
    }

    const haystack = `${event.name} ${event.speakerName}`.toLowerCase();
    return haystack.includes(query);
  });
}

export function buildEventsSearchQuery(
  search: string,
  status: StatusFilter,
  date: DateFilter
): string {
  const params = new URLSearchParams();

  const trimmedSearch = search.trim();
  if (trimmedSearch) {
    params.set("search", trimmedSearch);
  }
  if (status !== "all") {
    params.set("status", status);
  }
  if (date !== "all") {
    params.set("date", date);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function hasActiveFilters(
  search: string,
  status: StatusFilter,
  date: DateFilter
): boolean {
  return Boolean(search.trim()) || status !== "all" || date !== "all";
}
