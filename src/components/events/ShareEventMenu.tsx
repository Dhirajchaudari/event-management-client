"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, Copy, Link2, Mail, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { EventRecord } from "@/lib/types";
import { pushToast } from "@/store/toast.store";

interface ShareEventMenuProps {
  event: EventRecord;
  size?: "default" | "lg";
  className?: string;
}

function buildShareUrl(event: EventRecord): string {
  if (typeof window === "undefined") {
    return "";
  }
  return window.location.href;
}

function openShareWindow(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer,width=600,height=520");
}

export function ShareEventMenu({
  event,
  size = "lg",
  className
}: ShareEventMenuProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  async function handleCopyLink(): Promise<void> {
    const url = buildShareUrl(event);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      pushToast("Link copied to clipboard", "success");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      pushToast("Could not copy link", "error");
    }
  }

  async function handleNativeShare(): Promise<void> {
    const url = buildShareUrl(event);
    if (!navigator.share) {
      await handleCopyLink();
      return;
    }

    try {
      await navigator.share({
        title: event.name,
        text: `Join us for ${event.name}`,
        url
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      pushToast("Could not share event", "error");
    }
  }

  function shareToLinkedIn(): void {
    const url = encodeURIComponent(buildShareUrl(event));
    openShareWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`);
  }

  function shareToWhatsApp(): void {
    const url = buildShareUrl(event);
    const text = encodeURIComponent(`Join us for ${event.name}: ${url}`);
    openShareWindow(`https://wa.me/?text=${text}`);
  }

  function shareByEmail(): void {
    const url = buildShareUrl(event);
    const subject = encodeURIComponent(event.name);
    const body = encodeURIComponent(
      `I thought you might be interested in this event:\n\n${event.name}\n${url}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary" size={size} className={className}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[13rem] rounded-2xl border border-border/80 bg-surface p-1.5 shadow-xl"
        >
          {canNativeShare ? (
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none hover:bg-background"
              onSelect={() => {
                void handleNativeShare();
              }}
            >
              <Share2 className="h-4 w-4 text-muted" />
              Share via device
            </DropdownMenu.Item>
          ) : null}

          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none hover:bg-background"
            onSelect={() => {
              void handleCopyLink();
            }}
          >
            {copied ? (
              <Check className="h-4 w-4 text-teal" />
            ) : (
              <Copy className="h-4 w-4 text-muted" />
            )}
            {copied ? "Copied!" : "Copy link"}
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-border/70" />

          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none hover:bg-background"
            onSelect={shareToLinkedIn}
          >
            <Link2 className="h-4 w-4 text-muted" />
            LinkedIn
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none hover:bg-background"
            onSelect={shareToWhatsApp}
          >
            <MessageCircle className="h-4 w-4 text-muted" />
            WhatsApp
          </DropdownMenu.Item>

          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground outline-none hover:bg-background"
            onSelect={shareByEmail}
          >
            <Mail className="h-4 w-4 text-muted" />
            Email
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
