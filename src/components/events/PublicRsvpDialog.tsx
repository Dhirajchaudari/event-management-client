"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

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
import { gqlPublicRequest } from "@/lib/public-graphql";
import {
  mapRsvpServerError,
  validateRsvpForm,
  validateRsvpName,
  validateRsvpEmail,
  type RsvpFormErrors,
  type RsvpFormValues
} from "@/lib/rsvp-validation";
import type { EventRecord } from "@/lib/types";
import { pushToast } from "@/store/toast.store";

const EMPTY_RSVP_FORM: RsvpFormValues = {
  name: "",
  email: "",
  specialty: ""
};

const EMPTY_RSVP_ERRORS: RsvpFormErrors = {};

interface PublicRsvpDialogProps {
  event: EventRecord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PublicRsvpDialog({
  event,
  open,
  onOpenChange,
  onSuccess
}: PublicRsvpDialogProps): React.JSX.Element {
  const [rsvpForm, setRsvpForm] = useState<RsvpFormValues>(EMPTY_RSVP_FORM);
  const [rsvpErrors, setRsvpErrors] = useState<RsvpFormErrors>(EMPTY_RSVP_ERRORS);
  const [saving, setSaving] = useState(false);

  function resetForm(): void {
    setRsvpForm(EMPTY_RSVP_FORM);
    setRsvpErrors(EMPTY_RSVP_ERRORS);
  }

  function handleOpenChange(next: boolean): void {
    if (!next) {
      resetForm();
    }
    onOpenChange(next);
  }

  async function handleSubmit(eventSubmit: React.FormEvent): Promise<void> {
    eventSubmit.preventDefault();

    const errors = validateRsvpForm(rsvpForm);
    setRsvpErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      await gqlPublicRequest<{ rsvpToEvent: { id: string } }>(
        `mutation RsvpToEvent($eventId: ID!, $name: String!, $email: String!, $specialty: String) {
          rsvpToEvent(eventId: $eventId, name: $name, email: $email, specialty: $specialty) {
            id
          }
        }`,
        {
          eventId: event.id,
          name: rsvpForm.name.trim(),
          email: rsvpForm.email.trim(),
          specialty: rsvpForm.specialty.trim() || null
        }
      );

      pushToast("You're registered! We'll be in touch.", "success");
      handleOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to register";
      const mapped = mapRsvpServerError(message);
      if (Object.keys(mapped).length > 0) {
        setRsvpErrors(mapped);
      } else {
        pushToast(message, "error");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md rounded-[1.5rem] border-border/80 bg-surface p-0">
        <DialogHeader className="border-b border-border/60 px-6 py-5">
          <DialogTitle className="font-display text-xl">Register interest</DialogTitle>
          <DialogDescription>
            RSVP for <span className="text-foreground">{event.name}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="rsvp-name">Full name</Label>
            <Input
              id="rsvp-name"
              value={rsvpForm.name}
              onChange={(e) => {
                setRsvpForm((prev) => ({ ...prev, name: e.target.value }));
                if (rsvpErrors.name) {
                  setRsvpErrors((prev) => ({ ...prev, name: validateRsvpName(e.target.value) }));
                }
              }}
              placeholder="Dr. Jane Smith"
              autoComplete="name"
            />
            {rsvpErrors.name ? <p className="text-xs text-danger">{rsvpErrors.name}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rsvp-email">Email</Label>
            <Input
              id="rsvp-email"
              type="email"
              value={rsvpForm.email}
              onChange={(e) => {
                setRsvpForm((prev) => ({ ...prev, email: e.target.value }));
                if (rsvpErrors.email) {
                  setRsvpErrors((prev) => ({ ...prev, email: validateRsvpEmail(e.target.value) }));
                }
              }}
              placeholder="you@clinic.org"
              autoComplete="email"
            />
            {rsvpErrors.email ? <p className="text-xs text-danger">{rsvpErrors.email}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rsvp-specialty">Specialty (optional)</Label>
            <Input
              id="rsvp-specialty"
              value={rsvpForm.specialty}
              onChange={(e) => setRsvpForm((prev) => ({ ...prev, specialty: e.target.value }))}
              placeholder="Cardiology"
            />
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Confirm registration"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
