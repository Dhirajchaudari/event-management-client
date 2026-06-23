import { create } from "zustand";

import type { EventRecord } from "@/lib/types";

interface EventsState {
  events: EventRecord[];
  loading: boolean;
  setEvents: (events: EventRecord[]) => void;
  setLoading: (loading: boolean) => void;
  updateEvent: (id: string, patch: Partial<EventRecord>) => void;
  removeEvent: (id: string) => void;
}

export const useEventsStore = create<EventsState>((set) => ({
  events: [],
  loading: true,
  setEvents: (events) => set({ events }),
  setLoading: (loading) => set({ loading }),
  updateEvent: (id, patch) =>
    set((state) => ({
      events: state.events.map((event) => (event.id === id ? { ...event, ...patch } : event))
    })),
  removeEvent: (id) =>
    set((state) => ({
      events: state.events.filter((event) => event.id !== id)
    }))
}));
