"use client";

import { Loader2, Save, Sparkles } from "lucide-react";
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
    return "Gemini is temporarily busy. Try again shortly or enter content manually below.";
  }
  if (message.includes("429")) {
    return "Gemini rate limit reached. Wait a moment or enter content manually below.";
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

  const hasGeneratedContent = Boolean(eventDescription.trim() || speakerIntro.trim());
  const generateLabel = hasGeneratedContent ? "Regenerate" : "Generate with AI";

  async function resolveEventId(context: EventAiContext): Promise<string> {
    return eventId ?? (await onEnsureEventSaved(context));
  }

  async function handleGenerate(): Promise<void> {
    const context = getEventContext();

    if (!isContextReady(context)) {
      pushToast("Fill in event name, date, and speaker details first", "error");
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
      if (error instanceof UnauthorizedError) {
        return;
      }
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
      pushToast("Fill in event name, date, and speaker details first", "error");
      return;
    }

    if (!eventDescription.trim() && !speakerIntro.trim()) {
      pushToast("Enter an event description or speaker introduction to save", "error");
      return;
    }

    setSaving(true);
    try {
      const resolvedEventId = await resolveEventId(context);
      await onSaveContent(resolvedEventId, {
        eventDescription: eventDescription.trim(),
        speakerIntro: speakerIntro.trim()
      });
      pushToast("Event content saved", "success");
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return;
      }
      const message = error instanceof Error ? error.message : "Failed to save content";
      pushToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  const busy = generating || saving;

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-background/25 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Event content</p>
          <p className="mt-1 text-sm text-muted">
            Generate with AI or type the description and speaker introduction manually.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
          <Button
            type="button"
            variant={hasGeneratedContent ? "secondary" : "default"}
            disabled={busy}
            onClick={() => void handleGenerate()}
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {generating ? "Generating..." : generateLabel}
          </Button>
          {onSaveContent ? (
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => void handleSaveManual()}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : "Save content"}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ai-event-description">Event description</Label>
          <Textarea
            id="ai-event-description"
            value={eventDescription}
            onChange={(event) => setEventDescription(event.target.value)}
            rows={7}
            disabled={busy}
            placeholder="Write or generate a professional CME event description..."
            className="resize-y"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ai-speaker-intro">Speaker introduction</Label>
          <Textarea
            id="ai-speaker-intro"
            value={speakerIntro}
            onChange={(event) => setSpeakerIntro(event.target.value)}
            rows={5}
            disabled={busy}
            placeholder="Write or generate a short speaker bio..."
            className="resize-y"
          />
        </div>
      </div>
    </div>
  );
}
