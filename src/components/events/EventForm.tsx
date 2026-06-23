"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EventFormValues } from "@/lib/types";

interface EventFormProps {
  initialValues: EventFormValues;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (values: EventFormValues) => Promise<void>;
  onCancel: () => void;
}

export function EventForm({
  initialValues,
  submitLabel,
  loading = false,
  onSubmit,
  onCancel
}: EventFormProps): React.JSX.Element {
  const [values, setValues] = useState<EventFormValues>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

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

      <div className="space-y-2">
        <Label htmlFor="speaker-photo-url">Speaker photo URL</Label>
        <Input
          id="speaker-photo-url"
          type="url"
          value={values.speakerPhotoUrl}
          onChange={(event) => updateField("speakerPhotoUrl", event.target.value)}
          placeholder="https://..."
        />
      </div>

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
