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
    <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
      <div className="space-y-2">
        <Label htmlFor="event-name">Event name</Label>
        <Input
          id="event-name"
          value={values.name}
          onChange={(event) => updateField("name", event.target.value)}
          placeholder="Advances in Fetal Medicine"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="event-date">Date</Label>
        <DateInput
          id="event-date"
          value={values.date}
          onChange={(event) => updateField("date", event.target.value)}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="speaker-name">Speaker</Label>
          <Input
            id="speaker-name"
            value={values.speakerName}
            onChange={(event) => updateField("speakerName", event.target.value)}
            placeholder="Dr. Jane Smith"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="speaker-designation">Designation</Label>
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

      {onEnsureEventSaved ? (
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

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
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
