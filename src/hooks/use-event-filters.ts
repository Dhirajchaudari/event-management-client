"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import {
  buildEventsSearchQuery,
  hasActiveFilters,
  parseDateFilter,
  parseStatusFilter,
  type DateFilter,
  type StatusFilter
} from "@/lib/event-filters";

export function useEventFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(() => searchParams.get("search") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);

  const statusFilter = parseStatusFilter(searchParams.get("status"));
  const dateFilter = parseDateFilter(searchParams.get("date"));

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const replaceQuery = useCallback(
    (search: string, status: StatusFilter, date: DateFilter) => {
      const nextQuery = buildEventsSearchQuery(search, status, date);
      const currentQuery = typeof window !== "undefined" ? window.location.search : "";

      if (nextQuery === currentQuery) {
        return;
      }

      router.replace(`${pathname}${nextQuery}`, { scroll: false });
    },
    [pathname, router]
  );

  useEffect(() => {
    replaceQuery(debouncedSearch, statusFilter, dateFilter);
  }, [debouncedSearch, statusFilter, dateFilter, replaceQuery]);

  const setStatusFilter = useCallback(
    (status: StatusFilter) => {
      replaceQuery(debouncedSearch, status, dateFilter);
    },
    [dateFilter, debouncedSearch, replaceQuery]
  );

  const setDateFilter = useCallback(
    (date: DateFilter) => {
      replaceQuery(debouncedSearch, statusFilter, date);
    },
    [debouncedSearch, replaceQuery, statusFilter]
  );

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setDebouncedSearch("");
    replaceQuery("", "all", "all");
  }, [replaceQuery]);

  return {
    searchInput,
    setSearchInput,
    debouncedSearch,
    statusFilter,
    dateFilter,
    setStatusFilter,
    setDateFilter,
    clearFilters,
    hasActiveFilters: hasActiveFilters(debouncedSearch, statusFilter, dateFilter)
  };
}
