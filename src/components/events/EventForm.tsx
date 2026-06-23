"use client";

import { useState } from "react";

import { SpeakerPhotoField } from "@/components/events/SpeakerPhotoField";
import { EventAiContentSection } from "@/components/events/EventAiContentSection";
import { Button } from "@/components/ui/button";
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
  onAiContentGenerated?: (content: {
    eventDescription: string;
    speakerIntro: string;
  }) => void;
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
  onAiContentGenerated
}: EventFormProps): React.JSX.Element {
  const [values, setValues] = useState<EventFormValues>(initialValues);

  function updateField<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]): void {
    setValues((current) => ({ ...current, [key]: value }));
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
        <Input
          id="event-date"
          type="date"
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

      {eventId ? (
        <EventAiContentSection
          key={`${eventId}-${initialAiDescription ?? ""}-${initialAiSpeakerIntro ?? ""}`}
          eventId={eventId}
          initialEventDescription={initialAiDescription}
          initialSpeakerIntro={initialAiSpeakerIntro}
          onGenerated={onAiContentGenerated}
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
