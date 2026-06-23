"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/format";
import { uploadSpeakerPhoto, UnauthorizedError } from "@/lib/upload";
import { pushToast } from "@/store/toast.store";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

interface SpeakerPhotoFieldProps {
  speakerName: string;
  photoUrl: string;
  disabled?: boolean;
  onChange: (url: string) => void;
  onRemovePersisted?: () => Promise<void>;
}

export function SpeakerPhotoField({
  speakerName,
  photoUrl,
  disabled = false,
  onChange,
  onRemovePersisted
}: SpeakerPhotoFieldProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      pushToast("Please choose a JPEG, PNG, WebP, or GIF image", "error");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      pushToast("Image must be 5 MB or smaller", "error");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadSpeakerPhoto(file);
      onChange(url);
      pushToast("Speaker photo uploaded", "success");
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return;
      }
      const message = error instanceof Error ? error.message : "Upload failed";
      pushToast(message, "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove(): Promise<void> {
    onChange("");
    if (!onRemovePersisted) {
      return;
    }

    setRemoving(true);
    try {
      await onRemovePersisted();
      pushToast("Speaker photo removed", "success");
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return;
      }
      const message = error instanceof Error ? error.message : "Failed to remove photo";
      pushToast(message, "error");
    } finally {
      setRemoving(false);
    }
  }

  const busy = disabled || uploading || removing;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/20 px-3 py-3">
      <Avatar key={photoUrl || "no-photo"} className="h-12 w-12 shrink-0 rounded-xl border border-border/70">
        {photoUrl ? <AvatarImage src={photoUrl} alt={speakerName || "Speaker"} /> : null}
        <AvatarFallback className="text-xs">{getInitials(speakerName || "Speaker")}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-foreground">Speaker photo</p>
        <p className="text-[11px] text-muted">Optional · up to 5 MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        disabled={busy}
        onChange={(event) => void handleFileSelect(event)}
      />

      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
          {uploading ? "..." : photoUrl ? "Replace" : "Upload"}
        </Button>
        {photoUrl ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="px-2"
            disabled={busy}
            onClick={() => void handleRemove()}
          >
            {removing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
