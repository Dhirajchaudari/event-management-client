"use client";

import * as React from "react";
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { getEventStatusLabel } from "@/lib/event-status";
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
  const [status, setStatus] = React.useState<EventStatus>(event?.status ?? "published");

  React.useEffect(() => {
    if (event) setStatus(event.status);
  }, [event]);

  return (
    <Dialog open={event !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update status</DialogTitle>
          <DialogDescription>
            {event ? `Change the publication status for "${event.name}".` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Status</p>
          <Select.Root value={status} onValueChange={(value) => setStatus(value as EventStatus)}>
            <Select.Trigger className="flex h-11 w-full items-center justify-between rounded-xl border border-border/80 bg-background/60 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20">
              <Select.Value />
              <Select.Icon>
                <ChevronDown className="h-4 w-4 text-muted" />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className="z-50 overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-xl">
                <Select.Viewport className="p-1.5">
                  {EVENT_STATUSES.map((option) => (
                    <Select.Item
                      key={option}
                      value={option}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-xl px-8 py-2.5 text-sm outline-none",
                        "focus:bg-background data-[highlighted]:bg-background"
                      )}
                    >
                      <Select.ItemText>{getEventStatusLabel(option)}</Select.ItemText>
                      <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                        <Check className="h-4 w-4 text-accent" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button disabled={loading} onClick={() => void onSave(status)}>
            {loading ? "Saving..." : "Save status"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
