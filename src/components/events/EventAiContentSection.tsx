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
}

function isContextReady(context: EventAiContext): boolean {
  return (
    context.name.trim() !== "" &&
    context.date.trim() !== "" &&
    context.speakerName.trim() !== "" &&
    context.speakerDesignation.trim() !== ""
  );
}

export function EventAiContentSection({
  eventId,
  initialEventDescription = "",
  initialSpeakerIntro = "",
  getEventContext,
  onEnsureEventSaved,
  onGenerated
}: EventAiContentSectionProps): React.JSX.Element {
  const [eventDescription, setEventDescription] = useState(initialEventDescription);
  const [speakerIntro, setSpeakerIntro] = useState(initialSpeakerIntro);
  const [generating, setGenerating] = useState(false);

  const hasContent = Boolean(eventDescription.trim() || speakerIntro.trim());
  const buttonLabel = hasContent ? "Regenerate" : "Generate with AI";

  async function handleGenerate(): Promise<void> {
    const context = getEventContext();

    if (!isContextReady(context)) {
      pushToast("Fill in event name, date, and speaker details first", "error");
      return;
    }

    setGenerating(true);
    try {
      const resolvedEventId = eventId ?? (await onEnsureEventSaved(context));

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
      pushToast(message, "error");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-background/25 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">AI content</p>
          <p className="mt-1 text-sm text-muted">
            Generate professional CME copy for doctors and healthcare audiences.
          </p>
        </div>
        <Button
          type="button"
          variant={hasContent ? "secondary" : "default"}
          className="shrink-0"
          disabled={generating}
          onClick={() => void handleGenerate()}
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {generating ? "Generating..." : buttonLabel}
        </Button>
      </div>

      {(hasContent || generating) && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-event-description">Event description</Label>
            <Textarea
              id="ai-event-description"
              readOnly
              value={eventDescription}
              rows={7}
              placeholder={generating ? "Generating event description..." : ""}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ai-speaker-intro">Speaker introduction</Label>
            <Textarea
              id="ai-speaker-intro"
              readOnly
              value={speakerIntro}
              rows={5}
              placeholder={generating ? "Generating speaker introduction..." : ""}
              className="resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
