"use client";

import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EventAiContentSectionProps {
  eventDescription: string;
  speakerIntro: string;
  generating?: boolean;
  onDescriptionChange: (value: string) => void;
  onSpeakerIntroChange: (value: string) => void;
  onGenerate: () => void;
}

export function EventAiContentSection({
  eventDescription,
  speakerIntro,
  generating = false,
  onDescriptionChange,
  onSpeakerIntroChange,
  onGenerate
}: EventAiContentSectionProps): React.JSX.Element {
  const hasContent = Boolean(eventDescription.trim() || speakerIntro.trim());

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">Optional session copy</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-accent hover:text-accent"
          disabled={generating}
          onClick={onGenerate}
        >
          {generating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {generating ? "Generating…" : hasContent ? "Regenerate" : "Generate with AI"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ai-event-description" className="text-xs text-muted">
            Event description
          </Label>
          <Textarea
            id="ai-event-description"
            value={eventDescription}
            onChange={(event) => onDescriptionChange(event.target.value)}
            rows={4}
            placeholder="CME session overview…"
            disabled={generating}
            className="resize-none text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ai-speaker-intro" className="text-xs text-muted">
            Speaker introduction
          </Label>
          <Textarea
            id="ai-speaker-intro"
            value={speakerIntro}
            onChange={(event) => onSpeakerIntroChange(event.target.value)}
            rows={4}
            placeholder="Short speaker bio…"
            disabled={generating}
            className="resize-none text-sm"
          />
        </div>
      </div>
    </div>
  );
}
