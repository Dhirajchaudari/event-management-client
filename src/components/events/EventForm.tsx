"use client";

import { useState } from "react";

import {
  EventAiContentSection,
  type EventAiContext
} from "@/components/events/EventAiContentSection";
import { SpeakerPhotoField } from "@/components/events/SpeakerPhotoField";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EventFormValues } from "@/lib/types";
import { cn } from "@/lib/utils";

type FormTab = "details" | "content";

interface EventFormProps {
  initialValues: EventFormValues;
  submitLabel: string;
  loading?: boolean;
  eventId?: string;
  initialAiDescription?: string;
  initialAiSpeakerIntro?: string;
  onSubmit: (values: EventFormValues) => Promise<void>;
  onCancel: () => void;
  onRemovePersistedPhoto?: () => Promise<void>;
  onEnsureEventSaved?: (context: EventAiContext) => Promise<string>;
  onAiContentGenerated?: (
    eventId: string,
    content: {
      eventDescription: string;
      speakerIntro: string;
    }
  ) => void;
  onSaveEventContent?: (
    eventId: string,
    content: {
      eventDescription: string;
      speakerIntro: string;
    }
  ) => Promise<void>;
}

function TabButton({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-accent/15 text-accent"
          : "text-muted hover:bg-background/60 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function EventForm({
  initialValues,
  submitLabel,
  loading = false,
  eventId,
  initialAiDescription,
  initialAiSpeakerIntro,
  onSubmit,
  onCancel,
  onRemovePersistedPhoto,
  onEnsureEventSaved,
  onAiContentGenerated,
  onSaveEventContent
}: EventFormProps): React.JSX.Element {
  const [values, setValues] = useState<EventFormValues>(initialValues);
  const [activeTab, setActiveTab] = useState<FormTab>("details");

  const hasSavedContent = Boolean(initialAiDescription?.trim() || initialAiSpeakerIntro?.trim());

  function updateField<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]): void {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function getEventContext(): EventAiContext {
    return {
      name: values.name,
      date: values.date,
      speakerName: values.speakerName,
      speakerDesignation: values.speakerDesignation,
      speakerPhotoUrl: values.speakerPhotoUrl.trim() || undefined
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await onSubmit(values);
  }

  return (
    <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => void handleSubmit(event)}>
      <div className="flex gap-1 border-b border-border/50 pb-3">
        <TabButton active={activeTab === "details"} onClick={() => setActiveTab("details")}>
          Details
        </TabButton>
        <TabButton active={activeTab === "content"} onClick={() => setActiveTab("content")}>
          Content
          {hasSavedContent ? <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden /> : null}
        </TabButton>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        {activeTab === "details" ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="event-name" className="text-xs text-muted">
                Event name
              </Label>
              <Input
                id="event-name"
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Advances in Fetal Medicine"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-date" className="text-xs text-muted">
                Date
              </Label>
              <DateInput
                id="event-date"
                value={values.date}
                onChange={(event) => updateField("date", event.target.value)}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="speaker-name" className="text-xs text-muted">
                  Speaker
                </Label>
                <Input
                  id="speaker-name"
                  value={values.speakerName}
                  onChange={(event) => updateField("speakerName", event.target.value)}
                  placeholder="Dr. Jane Smith"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="speaker-designation" className="text-xs text-muted">
                  Designation
                </Label>
                <Input
                  id="speaker-designation"
                  value={values.speakerDesignation}
                  onChange={(event) => updateField("speakerDesignation", event.target.value)}
                  placeholder="Senior Consultant"
                  required
                />
              </div>
            </div>

            <SpeakerPhotoField
              speakerName={values.speakerName}
              photoUrl={values.speakerPhotoUrl}
              disabled={loading}
              onChange={(url) => updateField("speakerPhotoUrl", url)}
              onRemovePersisted={onRemovePersistedPhoto}
            />
          </div>
        ) : null}

        {activeTab === "content" && onEnsureEventSaved ? (
          <EventAiContentSection
            key={`${eventId ?? "new"}-${initialAiDescription ?? ""}-${initialAiSpeakerIntro ?? ""}`}
            eventId={eventId}
            initialEventDescription={initialAiDescription}
            initialSpeakerIntro={initialAiSpeakerIntro}
            getEventContext={getEventContext}
            onEnsureEventSaved={onEnsureEventSaved}
            onGenerated={onAiContentGenerated}
            onSaveContent={onSaveEventContent}
          />
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border/50 pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
