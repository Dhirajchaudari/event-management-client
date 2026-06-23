"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { gqlRequest, UnauthorizedError } from "@/lib/graphql";
import { pushToast } from "@/store/toast.store";

export interface GeneratedEventContent {
  eventDescription: string;
  speakerIntro: string;
}

export interface EventAiContext {
  name: string;
  date: string;
  speakerName: string;
  speakerDesignation: string;
  speakerPhotoUrl?: string;
}

interface EventAiContentSectionProps {
  eventId?: string;
  initialEventDescription?: string;
  initialSpeakerIntro?: string;
  getEventContext: () => EventAiContext;
  onEnsureEventSaved: (context: EventAiContext) => Promise<string>;
  onGenerated?: (eventId: string, content: GeneratedEventContent) => void;
  onSaveContent?: (eventId: string, content: GeneratedEventContent) => Promise<void>;
}

function isContextReady(context: EventAiContext): boolean {
  return (
    context.name.trim() !== "" &&
    context.date.trim() !== "" &&
    context.speakerName.trim() !== "" &&
    context.speakerDesignation.trim() !== ""
  );
}

function formatAiError(message: string): string {
  if (message.includes("503") || message.toLowerCase().includes("high demand")) {
    return "Gemini is busy — try again or type content below.";
  }
  if (message.includes("429")) {
    return "Rate limit hit — wait a moment or type content below.";
  }
  return message;
}

export function EventAiContentSection({
  eventId,
  initialEventDescription = "",
  initialSpeakerIntro = "",
  getEventContext,
  onEnsureEventSaved,
  onGenerated,
  onSaveContent
}: EventAiContentSectionProps): React.JSX.Element {
  const [eventDescription, setEventDescription] = useState(initialEventDescription);
  const [speakerIntro, setSpeakerIntro] = useState(initialSpeakerIntro);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasContent = Boolean(eventDescription.trim() || speakerIntro.trim());
  const busy = generating || saving;

  async function resolveEventId(context: EventAiContext): Promise<string> {
    return eventId ?? (await onEnsureEventSaved(context));
  }

  async function handleGenerate(): Promise<void> {
    const context = getEventContext();

    if (!isContextReady(context)) {
      pushToast("Complete the Details tab first", "error");
      return;
    }

    setGenerating(true);
    try {
      const resolvedEventId = await resolveEventId(context);
      const data = await gqlRequest<{ generateEventContent: GeneratedEventContent }>(
        `mutation GenerateEventContent($eventId: ID!) {
          generateEventContent(eventId: $eventId) {
            eventDescription
            speakerIntro
          }
        }`,
        { eventId: resolvedEventId }
      );

      setEventDescription(data.generateEventContent.eventDescription);
      setSpeakerIntro(data.generateEventContent.speakerIntro);
      onGenerated?.(resolvedEventId, data.generateEventContent);
      pushToast("Content generated successfully", "success");
    } catch (error) {
      if (error instanceof UnauthorizedError) return;
      const message = error instanceof Error ? error.message : "Failed to generate content";
      pushToast(formatAiError(message), "error");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveManual(): Promise<void> {
    if (!onSaveContent) return;

    const context = getEventContext();
    if (!isContextReady(context)) {
      pushToast("Complete the Details tab first", "error");
      return;
    }
    if (!eventDescription.trim() && !speakerIntro.trim()) {
      pushToast("Add a description or speaker intro to save", "error");
      return;
    }

    setSaving(true);
    try {
      const resolvedEventId = await resolveEventId(context);
      await onSaveContent(resolvedEventId, {
        eventDescription: eventDescription.trim(),
        speakerIntro: speakerIntro.trim()
      });
      pushToast("Content saved", "success");
    } catch (error) {
      if (error instanceof UnauthorizedError) return;
      const message = error instanceof Error ? error.message : "Failed to save content";
      pushToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" disabled={busy} onClick={() => void handleGenerate()}>
          {generating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {generating ? "Generating…" : hasContent ? "Regenerate" : "Generate with AI"}
        </Button>
        {onSaveContent ? (
          <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={() => void handleSaveManual()}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {saving ? "Saving…" : "Save content"}
          </Button>
        ) : null}
        <span className="text-xs text-muted">AI optional — you can type below instead</span>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="ai-event-description" className="text-xs text-muted">
            Event description
          </Label>
          <Textarea
            id="ai-event-description"
            value={eventDescription}
            onChange={(event) => setEventDescription(event.target.value)}
            rows={5}
            disabled={busy}
            placeholder="Professional CME description for this session…"
            className="min-h-[120px] resize-y text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ai-speaker-intro" className="text-xs text-muted">
            Speaker introduction
          </Label>
          <Textarea
            id="ai-speaker-intro"
            value={speakerIntro}
            onChange={(event) => setSpeakerIntro(event.target.value)}
            rows={4}
            disabled={busy}
            placeholder="Short speaker bio (~100 words)…"
            className="min-h-[96px] resize-y text-sm"
          />
        </div>
      </div>
    </div>
  );
}
