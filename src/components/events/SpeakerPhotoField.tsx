"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getInitials } from "@/lib/format";
import { uploadSpeakerPhoto, UnauthorizedError } from "@/lib/upload";
import { pushToast } from "@/store/toast.store";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

interface SpeakerPhotoFieldProps {
  speakerName: string;
  photoUrl: string;
  disabled?: boolean;
  onChange: (url: string) => void;
}

export function SpeakerPhotoField({
  speakerName,
  photoUrl,
  disabled = false,
  onChange
}: SpeakerPhotoFieldProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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
      pushToast(message === "CLOUDINARY_NOT_CONFIGURED" ? "Photo upload is not configured on the server" : message, "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Label>Speaker photo</Label>
      <div className="flex items-center gap-4 rounded-2xl border border-border/70 bg-background/35 p-4">
        <Avatar className="h-16 w-16 rounded-2xl border border-border/70">
          {photoUrl ? <AvatarImage src={photoUrl} alt={speakerName || "Speaker"} /> : null}
          <AvatarFallback className="text-sm">{getInitials(speakerName || "Speaker")}</AvatarFallback>
        </Avatar>

        <div className="flex flex-1 flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={disabled || uploading}
            onChange={(event) => void handleFileSelect(event)}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {uploading ? "Uploading..." : photoUrl ? "Replace photo" : "Upload photo"}
          </Button>
          {photoUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || uploading}
              onClick={() => onChange("")}
            >
              <X className="h-4 w-4" />
              Remove
            </Button>
          ) : null}
        </div>
      </div>
      <p className="text-xs text-muted">JPEG, PNG, WebP, or GIF up to 5 MB. Stored on Cloudinary.</p>
    </div>
  );
}
