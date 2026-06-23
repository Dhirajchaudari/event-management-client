"use client";

import { Loader2, Plus, Search, Trash2, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCreatedDate, formatEventDate, formatRsvpDate, getInitials } from "@/lib/format";
import { gqlRequest, UnauthorizedError } from "@/lib/graphql";
import {
  mapRsvpServerError,
  validateRsvpEmail,
  validateRsvpForm,
  validateRsvpName,
  type RsvpFormErrors,
  type RsvpFormValues
} from "@/lib/rsvp-validation";
import type { AttendeeRecord, EventRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { pushToast } from "@/store/toast.store";

const ATTENDEE_FIELDS = `
  id
  eventId
  name
  email
  specialty
  rsvpAt
`;

interface ViewAttendeesDialogProps {
  event: EventRecord | null;
  onClose: () => void;
  onAttendeesChange?: (eventId: string, attendees: AttendeeRecord[]) => void;
}

const EMPTY_RSVP_FORM: RsvpFormValues = {
  name: "",
  email: "",
  specialty: ""
};

const EMPTY_RSVP_ERRORS: RsvpFormErrors = {};

export function ViewAttendeesDialog({
  event,
  onClose,
  onAttendeesChange
}: ViewAttendeesDialogProps): React.JSX.Element {
  const [attendees, setAttendees] = useState<AttendeeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showRsvpForm, setShowRsvpForm] = useState(false);
  const [rsvpForm, setRsvpForm] = useState<RsvpFormValues>(EMPTY_RSVP_FORM);
  const [rsvpErrors, setRsvpErrors] = useState<RsvpFormErrors>(EMPTY_RSVP_ERRORS);
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AttendeeRecord | null>(null);
  const onAttendeesChangeRef = useRef(onAttendeesChange);

  useEffect(() => {
    onAttendeesChangeRef.current = onAttendeesChange;
  }, [onAttendeesChange]);

  const syncAttendees = useCallback((eventId: string, next: AttendeeRecord[]) => {
    setAttendees(next);
    onAttendeesChangeRef.current?.(eventId, next);
  }, []);

  const loadAttendees = useCallback(async (eventId: string): Promise<void> => {
    setLoading(true);
    try {
      const data = await gqlRequest<{ getEventAttendees: AttendeeRecord[] }>(
        `query GetEventAttendees($eventId: ID!) {
          getEventAttendees(eventId: $eventId) {
            ${ATTENDEE_FIELDS}
          }
        }`,
        { eventId }
      );
      setAttendees(data.getEventAttendees);
      onAttendeesChangeRef.current?.(eventId, data.getEventAttendees);
    } catch (error) {
      if (error instanceof UnauthorizedError) return;
      const message = error instanceof Error ? error.message : "Failed to load attendees";
      pushToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!event) {
      setAttendees([]);
      setShowRsvpForm(false);
      setRsvpForm(EMPTY_RSVP_FORM);
      setRsvpErrors(EMPTY_RSVP_ERRORS);
      setAttendeeSearch("");
      setDeleteTarget(null);
      return;
    }

    setAttendees(event.attendees ?? []);
    void loadAttendees(event.id);
  }, [event?.id, loadAttendees]);

  const existingEmails = attendees.map((attendee) => attendee.email);

  const filteredAttendees = attendeeSearch.trim()
    ? attendees.filter((attendee) => {
        const query = attendeeSearch.trim().toLowerCase();
        return (
          attendee.email.toLowerCase().includes(query) ||
          attendee.name.toLowerCase().includes(query) ||
          (attendee.specialty?.toLowerCase().includes(query) ?? false)
        );
      })
    : attendees;

  function resetRsvpForm(): void {
    setRsvpForm(EMPTY_RSVP_FORM);
    setRsvpErrors(EMPTY_RSVP_ERRORS);
  }

  async function handleAddRsvp(submitEvent: React.FormEvent<HTMLFormElement>): Promise<void> {
    submitEvent.preventDefault();
    if (!event) return;

    const errors = validateRsvpForm(rsvpForm, existingEmails);
    if (Object.keys(errors).length > 0) {
      setRsvpErrors(errors);
      return;
    }

    setRsvpErrors(EMPTY_RSVP_ERRORS);
    setSaving(true);
    try {
      const data = await gqlRequest<{ rsvpToEvent: AttendeeRecord }>(
        `mutation RsvpToEvent($eventId: ID!, $name: String!, $email: String!, $specialty: String) {
          rsvpToEvent(eventId: $eventId, name: $name, email: $email, specialty: $specialty) {
            ${ATTENDEE_FIELDS}
          }
        }`,
        {
          eventId: event.id,
          name: rsvpForm.name.trim(),
          email: rsvpForm.email.trim(),
          specialty: rsvpForm.specialty.trim() || null
        }
      );

      setAttendees((current) => {
        const next = [data.rsvpToEvent, ...current];
        onAttendeesChangeRef.current?.(event.id, next);
        return next;
      });
      setRsvpForm(EMPTY_RSVP_FORM);
      setRsvpErrors(EMPTY_RSVP_ERRORS);
      setShowRsvpForm(false);
      pushToast("RSVP added", "success");
    } catch (error) {
      if (error instanceof UnauthorizedError) return;
      const message = error instanceof Error ? error.message : "Failed to add RSVP";
      const fieldErrors = mapRsvpServerError(message);
      if (Object.keys(fieldErrors).length > 0) {
        setRsvpErrors(fieldErrors);
      } else {
        pushToast(message, "error");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelRsvp(): Promise<void> {
    if (!event || !deleteTarget) return;

    setSaving(true);
    try {
      await gqlRequest(
        `mutation CancelRsvp($attendeeId: ID!) {
          cancelRsvp(attendeeId: $attendeeId)
        }`,
        { attendeeId: deleteTarget.id }
      );

      const nextAttendees = attendees.filter((attendee) => attendee.id !== deleteTarget.id);
      syncAttendees(event.id, nextAttendees);
      setDeleteTarget(null);
      pushToast("RSVP removed", "success");
    } catch (error) {
      if (error instanceof UnauthorizedError) return;
      const message = error instanceof Error ? error.message : "Failed to remove RSVP";
      pushToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Dialog open={event !== null} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="flex max-h-[min(90vh,760px)] w-[min(94vw,40rem)] max-w-none flex-col gap-0 overflow-hidden p-0">
          <div className="border-b border-border/60 px-6 py-5">
            <DialogHeader className="space-y-2 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle>Attendees</DialogTitle>
                {event ? (
                  <Badge variant="muted" className="normal-case tracking-normal">
                    <Users className="mr-1 h-3 w-3" />
                    {attendees.length} RSVP{attendees.length === 1 ? "" : "s"}
                  </Badge>
                ) : null}
              </div>
              <DialogDescription>
                {event ? (
                  <>
                    {event.name} · {formatEventDate(event.date)} · Created{" "}
                    {formatCreatedDate(event.createdAt)}
                  </>
                ) : (
                  ""
                )}
              </DialogDescription>
            </DialogHeader>
          </div>

          {event ? (
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-6 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <Input
                    id="attendee-search"
                    type="search"
                    value={attendeeSearch}
                    onChange={(changeEvent) => setAttendeeSearch(changeEvent.target.value)}
                    placeholder="Search name or email..."
                    className="pl-9"
                    disabled={loading || attendees.length === 0}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={showRsvpForm ? "secondary" : "default"}
                  className="shrink-0"
                  disabled={loading || saving}
                  onClick={() => {
                    setShowRsvpForm((current) => !current);
                    if (showRsvpForm) resetRsvpForm();
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {showRsvpForm ? "Cancel" : "Add RSVP"}
                </Button>
              </div>

              {showRsvpForm ? (
                <form
                  className="shrink-0 space-y-3 rounded-2xl border border-border/70 bg-background/35 p-4"
                  onSubmit={(submitEvent) => void handleAddRsvp(submitEvent)}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="rsvp-name">Name</Label>
                      <Input
                        id="rsvp-name"
                        value={rsvpForm.name}
                        onChange={(changeEvent) => {
                          const name = changeEvent.target.value;
                          setRsvpForm((current) => ({ ...current, name }));
                          if (rsvpErrors.name) {
                            setRsvpErrors((current) => ({
                              ...current,
                              name: validateRsvpName(name)
                            }));
                          }
                        }}
                        onBlur={() => {
                          setRsvpErrors((current) => ({
                            ...current,
                            name: validateRsvpName(rsvpForm.name)
                          }));
                        }}
                        placeholder="Dr. Jane Smith"
                        disabled={saving}
                        aria-invalid={Boolean(rsvpErrors.name)}
                        className={cn(rsvpErrors.name && "border-danger/60")}
                      />
                      {rsvpErrors.name ? (
                        <p className="text-xs text-danger">{rsvpErrors.name}</p>
                      ) : null}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rsvp-email">Email</Label>
                      <Input
                        id="rsvp-email"
                        type="email"
                        value={rsvpForm.email}
                        onChange={(changeEvent) => {
                          const email = changeEvent.target.value;
                          setRsvpForm((current) => ({ ...current, email }));
                          if (rsvpErrors.email) {
                            setRsvpErrors((current) => ({
                              ...current,
                              email: validateRsvpEmail(email, existingEmails)
                            }));
                          }
                        }}
                        onBlur={() => {
                          setRsvpErrors((current) => ({
                            ...current,
                            email: validateRsvpEmail(rsvpForm.email, existingEmails)
                          }));
                        }}
                        placeholder="jane@hospital.org"
                        disabled={saving}
                        aria-invalid={Boolean(rsvpErrors.email)}
                        className={cn(rsvpErrors.email && "border-danger/60")}
                      />
                      {rsvpErrors.email ? (
                        <p className="text-xs text-danger">{rsvpErrors.email}</p>
                      ) : null}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rsvp-specialty">Specialty</Label>
                      <Input
                        id="rsvp-specialty"
                        value={rsvpForm.specialty}
                        onChange={(changeEvent) =>
                          setRsvpForm((current) => ({
                            ...current,
                            specialty: changeEvent.target.value
                          }))
                        }
                        placeholder="Cardiology"
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={saving}>
                      {saving ? "Saving..." : "Save RSVP"}
                    </Button>
                  </div>
                </form>
              ) : null}

              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-accent" />
                    Loading attendees...
                  </div>
                ) : attendees.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/70 px-4 py-12 text-center">
                    <p className="text-sm font-medium text-foreground">No RSVPs yet</p>
                    <p className="mt-2 text-sm text-muted">Add the first registration above.</p>
                  </div>
                ) : filteredAttendees.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border/70 px-4 py-12 text-center">
                    <p className="text-sm font-medium text-foreground">No matches found</p>
                    <p className="mt-2 text-sm text-muted">Try a different search term.</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {filteredAttendees.map((attendee) => (
                      <li
                        key={attendee.id}
                        className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/30 p-3"
                      >
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-surface text-xs font-medium text-foreground">
                          {getInitials(attendee.name)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground">{attendee.name}</p>
                          <p className="truncate text-sm text-muted">{attendee.email}</p>
                          <p className="mt-1 text-xs text-muted">
                            {[attendee.specialty, formatRsvpDate(attendee.rsvpAt)]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-danger hover:bg-danger/10 hover:text-danger"
                          disabled={saving}
                          aria-label={`Remove ${attendee.name}`}
                          onClick={() => setDeleteTarget(attendee)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this RSVP?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `${deleteTarget.name} (${deleteTarget.email}) will be removed from the attendee list.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={saving} onClick={() => void handleCancelRsvp()}>
              {saving ? "Removing..." : "Remove RSVP"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
