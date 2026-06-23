"use client";

import { Plus, RefreshCw } from "lucide-react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/events/EmptyState";
import { EventFiltersBar } from "@/components/events/EventFiltersBar";
import { EventForm } from "@/components/events/EventForm";
import { EventTable } from "@/components/events/EventTable";
import { FilteredEmptyState } from "@/components/events/FilteredEmptyState";
import { UpdateStatusDialog } from "@/components/events/UpdateStatusDialog";
import { ViewAttendeesDialog } from "@/components/events/ViewAttendeesDialog";
import { AppShell } from "@/components/layout/AppShell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { exportEventPdf } from "@/lib/export-pdf";
import { filterEvents } from "@/lib/event-filters";
import { normalizeEventRecord } from "@/lib/event-graphql";
import { gqlRequest, UnauthorizedError } from "@/lib/graphql";
import { toDateInputValue } from "@/lib/format";
import { useEventFilters } from "@/hooks/use-event-filters";
import {
  EMPTY_EVENT_FORM,
  type EventFormValues,
  type EventRecord,
  type EventStatus
} from "@/lib/types";
import { useEventsStore } from "@/store/events.store";
import { pushToast } from "@/store/toast.store";

const EVENT_FIELDS = `
  id
  name
  date
  speakerName
  speakerDesignation
  speakerPhotoUrl
  status
  attendeeCount
  aiDescription
  aiSpeakerIntro
  aiGeneratedAt
  createdAt
  updatedAt
`;

type DialogMode = "create" | "edit" | null;

function buildMutationInput(values: EventFormValues): Record<string, unknown> {
  return {
    name: values.name,
    date: values.date,
    speakerName: values.speakerName,
    speakerDesignation: values.speakerDesignation,
    speakerPhotoUrl: values.speakerPhotoUrl.trim()
  };
}

export default function EventsPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <AppShell title="Event lineup" subtitle="Loading your conference lineup...">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-[1.75rem] border border-border/50 bg-surface/40"
              />
            ))}
          </div>
        </AppShell>
      }
    >
      <EventsPageContent />
    </Suspense>
  );
}

function EventsPageContent(): React.JSX.Element {
  const events = useEventsStore((state) => state.events);
  const loading = useEventsStore((state) => state.loading);
  const setEvents = useEventsStore((state) => state.setEvents);
  const setLoading = useEventsStore((state) => state.setLoading);
  const updateEvent = useEventsStore((state) => state.updateEvent);
  const removeEvent = useEventsStore((state) => state.removeEvent);

  const [saving, setSaving] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [formSession, setFormSession] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventRecord | null>(null);
  const [statusTarget, setStatusTarget] = useState<EventRecord | null>(null);
  const [attendeesTarget, setAttendeesTarget] = useState<EventRecord | null>(null);

  const {
    searchInput,
    setSearchInput,
    debouncedSearch,
    statusFilter,
    dateFilter,
    setStatusFilter,
    setDateFilter,
    clearFilters
  } = useEventFilters();

  const filteredEvents = useMemo(
    () => filterEvents(events, debouncedSearch, statusFilter, dateFilter),
    [events, debouncedSearch, statusFilter, dateFilter]
  );

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await gqlRequest<{ events: EventRecord[] }>(
        `query { events { ${EVENT_FIELDS} } }`
      );
      setEvents(data.events.map(normalizeEventRecord));
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return;
      }
      const message = error instanceof Error ? error.message : "Failed to load events";
      pushToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [setEvents, setLoading]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  function openCreateDialog(): void {
    setSelectedEvent(null);
    setFormSession((current) => current + 1);
    setDialogMode("create");
  }

  function openEditDialog(event: EventRecord): void {
    setSelectedEvent(event);
    setFormSession((current) => current + 1);
    setDialogMode("edit");
  }

  function closeDialog(): void {
    setDialogMode(null);
    setSelectedEvent(null);
  }

  const formInitialValues = useMemo<EventFormValues>(
    () =>
      selectedEvent
        ? {
            name: selectedEvent.name,
            date: toDateInputValue(selectedEvent.date),
            speakerName: selectedEvent.speakerName,
            speakerDesignation: selectedEvent.speakerDesignation,
            speakerPhotoUrl: selectedEvent.speakerPhotoUrl ?? ""
          }
        : EMPTY_EVENT_FORM,
    [selectedEvent]
  );

  async function persistSpeakerPhotoRemoval(eventId: string): Promise<void> {
    await gqlRequest(
      `mutation UpdateEvent($id: String!, $input: UpdateEventInput!) {
        updateEvent(id: $id, input: $input) { id speakerPhotoUrl }
      }`,
      { id: eventId, input: { speakerPhotoUrl: "" } }
    );

    updateEvent(eventId, { speakerPhotoUrl: undefined });
    setSelectedEvent((current) =>
      current?.id === eventId ? { ...current, speakerPhotoUrl: undefined } : current
    );
  }

  async function handleSave(values: EventFormValues): Promise<void> {
    setSaving(true);
    try {
      const input = buildMutationInput(values);
      if (dialogMode === "create") {
        await gqlRequest(
          `mutation CreateEvent($input: CreateEventInput!) {
            createEvent(input: $input) { id }
          }`,
          { input }
        );
        pushToast("Event created", "success");
      } else if (dialogMode === "edit" && selectedEvent) {
        await gqlRequest(
          `mutation UpdateEvent($id: String!, $input: UpdateEventInput!) {
            updateEvent(id: $id, input: $input) { id }
          }`,
          { id: selectedEvent.id, input }
        );
        pushToast("Event updated", "success");
      }
      closeDialog();
      await loadEvents();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return;
      }
      const message = error instanceof Error ? error.message : "Failed to save event";
      pushToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await gqlRequest(
        `mutation DeleteEvent($id: String!) {
          deleteEvent(id: $id)
        }`,
        { id: deleteTarget.id }
      );
      pushToast("Event deleted", "success");
      removeEvent(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return;
      }
      const message = error instanceof Error ? error.message : "Failed to delete event";
      pushToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusSave(status: EventStatus): Promise<void> {
    if (!statusTarget) return;
    setSaving(true);
    try {
      const data = await gqlRequest<{ updateEventStatus: EventRecord }>(
        `mutation UpdateEventStatus($eventId: ID!, $status: EventStatus!) {
          updateEventStatus(eventId: $eventId, status: $status) {
            ${EVENT_FIELDS}
          }
        }`,
        { eventId: statusTarget.id, status }
      );
      const updated = normalizeEventRecord(data.updateEventStatus);
      updateEvent(updated.id, updated);
      pushToast("Status updated", "success");
      setStatusTarget(null);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return;
      }
      const message = error instanceof Error ? error.message : "Failed to update status";
      pushToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleExportPdf(event: EventRecord): Promise<void> {
    try {
      await exportEventPdf(event);
      pushToast("PDF exported", "success");
    } catch {
      pushToast("Failed to export PDF", "error");
    }
  }

  return (
    <AppShell
      title="Event lineup"
      subtitle="Curate sessions, speakers, and dates in a timeline built for conference teams."
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" size="icon" onClick={() => void loadEvents()} aria-label="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            New event
          </Button>
        </div>
      }
    >
      {loading && events.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-[1.75rem] border border-border/50 bg-surface/40"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState onCreate={openCreateDialog} />
      ) : (
        <div className="space-y-5">
          <EventFiltersBar
            search={searchInput}
            status={statusFilter}
            date={dateFilter}
            filteredCount={filteredEvents.length}
            totalCount={events.length}
            onSearchChange={setSearchInput}
            onStatusChange={setStatusFilter}
            onDateChange={setDateFilter}
          />

          {filteredEvents.length === 0 ? (
            <FilteredEmptyState onClearFilters={clearFilters} />
          ) : (
            <EventTable
              events={filteredEvents}
              onEdit={openEditDialog}
              onDelete={setDeleteTarget}
              onExportPdf={(event) => void handleExportPdf(event)}
              onUpdateStatus={setStatusTarget}
              onViewAttendees={setAttendeesTarget}
            />
          )}
        </div>
      )}

      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "Create event" : "Edit event"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Add a new session to your conference lineup."
                : "Update session details and speaker information."}
            </DialogDescription>
          </DialogHeader>
          <EventForm
            key={`${dialogMode ?? "closed"}-${formSession}`}
            initialValues={formInitialValues}
            submitLabel={dialogMode === "create" ? "Create event" : "Save changes"}
            loading={saving}
            eventId={dialogMode === "edit" && selectedEvent ? selectedEvent.id : undefined}
            initialAiDescription={selectedEvent?.aiDescription ?? undefined}
            initialAiSpeakerIntro={selectedEvent?.aiSpeakerIntro ?? undefined}
            onSubmit={handleSave}
            onCancel={closeDialog}
            onRemovePersistedPhoto={
              dialogMode === "edit" && selectedEvent
                ? () => persistSpeakerPhotoRemoval(selectedEvent.id)
                : undefined
            }
            onAiContentGenerated={(content) => {
              if (!selectedEvent) return;
              const generatedAt = new Date().toISOString();
              updateEvent(selectedEvent.id, {
                aiDescription: content.eventDescription,
                aiSpeakerIntro: content.speakerIntro,
                aiGeneratedAt: generatedAt
              });
              setSelectedEvent((current) =>
                current?.id === selectedEvent.id
                  ? {
                      ...current,
                      aiDescription: content.eventDescription,
                      aiSpeakerIntro: content.speakerIntro,
                      aiGeneratedAt: generatedAt
                    }
                  : current
              );
            }}
          />
        </DialogContent>
      </Dialog>

      <UpdateStatusDialog
        event={statusTarget}
        loading={saving}
        onClose={() => setStatusTarget(null)}
        onSave={handleStatusSave}
      />

      <ViewAttendeesDialog event={attendeesTarget} onClose={() => setAttendeesTarget(null)} />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `"${deleteTarget.name}" will be removed permanently from your lineup.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={saving} onClick={() => void handleDelete()}>
              {saving ? "Deleting..." : "Delete event"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
