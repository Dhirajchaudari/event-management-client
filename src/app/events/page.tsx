"use client";

import { Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { EmptyState } from "@/components/events/EmptyState";
import { EventCard } from "@/components/events/EventCard";
import { EventForm } from "@/components/events/EventForm";
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
import { gqlRequest, UnauthorizedError } from "@/lib/graphql";
import { toDateInputValue } from "@/lib/format";
import {
  EMPTY_EVENT_FORM,
  type EventFormValues,
  type EventRecord,
  type EventStatus
} from "@/lib/types";
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
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventRecord | null>(null);
  const [statusTarget, setStatusTarget] = useState<EventRecord | null>(null);
  const [attendeesTarget, setAttendeesTarget] = useState<EventRecord | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await gqlRequest<{ events: EventRecord[] }>(
        `query { events { ${EVENT_FIELDS} } }`
      );
      setEvents(data.events);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return;
      }
      const message = error instanceof Error ? error.message : "Failed to load events";
      pushToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  function openCreateDialog(): void {
    setSelectedEvent(null);
    setDialogMode("create");
  }

  function openEditDialog(event: EventRecord): void {
    setSelectedEvent(event);
    setDialogMode("edit");
  }

  function closeDialog(): void {
    setDialogMode(null);
    setSelectedEvent(null);
  }

  const formInitialValues: EventFormValues = selectedEvent
    ? {
        name: selectedEvent.name,
        date: toDateInputValue(selectedEvent.date),
        speakerName: selectedEvent.speakerName,
        speakerDesignation: selectedEvent.speakerDesignation,
        speakerPhotoUrl: selectedEvent.speakerPhotoUrl ?? ""
      }
    : EMPTY_EVENT_FORM;

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
      setDeleteTarget(null);
      await loadEvents();
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
      await gqlRequest(
        `mutation UpdateEvent($id: String!, $input: UpdateEventInput!) {
          updateEvent(id: $id, input: $input) { id }
        }`,
        { id: statusTarget.id, input: { status } }
      );
      pushToast("Status updated", "success");
      setStatusTarget(null);
      await loadEvents();
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

  function handleExportPdf(event: EventRecord): void {
    exportEventPdf(event);
    pushToast("PDF exported", "success");
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
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-[1.75rem] border border-border/50 bg-surface/40"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyState onCreate={openCreateDialog} />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={openEditDialog}
              onDelete={setDeleteTarget}
              onExportPdf={handleExportPdf}
              onUpdateStatus={setStatusTarget}
              onViewAttendees={setAttendeesTarget}
            />
          ))}
        </div>
      )}

      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "Create event" : "Edit event"}</DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Add a new session to your conference lineup."
                : "Update session details and speaker information."}
            </DialogDescription>
          </DialogHeader>
          <EventForm
            key={selectedEvent?.id ?? "create"}
            initialValues={formInitialValues}
            submitLabel={dialogMode === "create" ? "Create event" : "Save changes"}
            loading={saving}
            onSubmit={handleSave}
            onCancel={closeDialog}
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
