"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  getEventStatusLabel,
  isStatusOptionDisabled,
  isStatusTransitionAllowed
} from "@/lib/event-status";
import { EVENT_STATUSES, type EventRecord, type EventStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface UpdateStatusDialogProps {
  event: EventRecord | null;
  loading?: boolean;
  onClose: () => void;
  onSave: (status: EventStatus) => Promise<void>;
}

export function UpdateStatusDialog({
  event,
  loading = false,
  onClose,
  onSave
}: UpdateStatusDialogProps): React.JSX.Element {
  const [status, setStatus] = React.useState<EventStatus>(event?.status ?? "draft");

  React.useEffect(() => {
    if (event) setStatus(event.status);
  }, [event]);

  const canConfirm =
    event !== null &&
    status !== event.status &&
    isStatusTransitionAllowed(event.status, status);

  return (
    <Dialog open={event !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update status</DialogTitle>
          <DialogDescription>
            {event ? `Advance the lifecycle for "${event.name}".` : ""}
          </DialogDescription>
        </DialogHeader>

        <fieldset className="space-y-3">
          <legend className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            Status
          </legend>
          {EVENT_STATUSES.map((option) => {
            const disabled = event ? isStatusOptionDisabled(event.status, option) : true;
            const inputId = `status-${option}`;

            return (
              <label
                key={option}
                htmlFor={inputId}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition",
                  disabled
                    ? "cursor-not-allowed border-border/40 bg-background/20 opacity-50"
                    : "border-border/70 bg-background/35 hover:border-accent/40",
                  status === option && !disabled && "border-accent/50 bg-accent/5"
                )}
              >
                <input
                  id={inputId}
                  type="radio"
                  name="event-status"
                  value={option}
                  checked={status === option}
                  disabled={disabled || loading}
                  onChange={() => setStatus(option)}
                  className="h-4 w-4 accent-accent"
                />
                <span className="text-sm font-medium text-foreground">
                  {getEventStatusLabel(option)}
                </span>
              </label>
            );
          })}
        </fieldset>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button disabled={loading || !canConfirm} onClick={() => void onSave(status)}>
            {loading ? "Saving..." : "Confirm status"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
