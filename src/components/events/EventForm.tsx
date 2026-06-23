"use client";

import { useState } from "react";

import { EventAiContentSection } from "@/components/events/EventAiContentSection";
import { SpeakerPhotoField } from "@/components/events/SpeakerPhotoField";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EventFormValues } from "@/lib/types";

export interface EventContentValues {
  eventDescription: string;
  speakerIntro: string;
}

interface EventFormProps {
  initialValues: EventFormValues;
  content: EventContentValues;
  submitLabel: string;
  loading?: boolean;
  generating?: boolean;
  onSubmit: (values: EventFormValues, content: EventContentValues) => Promise<void>;
  onCancel: () => void;
  onContentChange: (content: EventContentValues) => void;
  onRemovePersistedPhoto?: () => Promise<void>;
  onGenerateContent?: (values: EventFormValues) => void;
}

export function EventForm({
  initialValues,
  content,
  submitLabel,
  loading = false,
  generating = false,
  onSubmit,
  onCancel,
  onContentChange,
  onRemovePersistedPhoto,
  onGenerateContent
}: EventFormProps): React.JSX.Element {
  const [values, setValues] = useState(initialValues);

  function updateField<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]): void {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await onSubmit(values, content);
  }

  const busy = loading || generating;

  return (
    <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="event-name">Event name</Label>
          <Input
            id="event-name"
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Advances in Women's Cardiovascular Health"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="event-date">Date</Label>
          <DateInput
            id="event-date"
            value={values.date}
            onChange={(event) => updateField("date", event.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="speaker-name">Speaker</Label>
          <Input
            id="speaker-name"
            value={values.speakerName}
            onChange={(event) => updateField("speakerName", event.target.value)}
            placeholder="Dr. Priya Mehta"
            required
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="speaker-designation">Designation</Label>
          <Input
            id="speaker-designation"
            value={values.speakerDesignation}
            onChange={(event) => updateField("speakerDesignation", event.target.value)}
            placeholder="Director, Women's Heart Program"
            required
          />
        </div>

        <div className="md:col-span-2">
          <SpeakerPhotoField
            speakerName={values.speakerName}
            photoUrl={values.speakerPhotoUrl}
            disabled={busy}
            onChange={(url) => updateField("speakerPhotoUrl", url)}
            onRemovePersisted={onRemovePersistedPhoto}
          />
        </div>
      </div>

      {onGenerateContent ? (
        <>
          <div className="h-px bg-border/60" />
          <EventAiContentSection
            eventDescription={content.eventDescription}
            speakerIntro={content.speakerIntro}
            generating={generating}
            onDescriptionChange={(eventDescription) =>
              onContentChange({ ...content, eventDescription })
            }
            onSpeakerIntroChange={(speakerIntro) =>
              onContentChange({ ...content, speakerIntro })
            }
            onGenerate={() => onGenerateContent?.(values)}
          />
        </>
      ) : null}

      <div className="flex flex-col-reverse gap-2 border-t border-border/50 pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
