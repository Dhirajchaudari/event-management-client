"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { useToastStore } from "@/store/toast.store";
import { cn } from "@/lib/utils";

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info
} as const;

export function Toaster(): React.JSX.Element {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={4200}>
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <ToastPrimitive.Root
            key={toast.id}
            className={cn(
              "group pointer-events-auto relative flex w-[min(92vw,380px)] items-start gap-3 overflow-hidden rounded-2xl border border-border/80 bg-surface/95 p-4 shadow-2xl backdrop-blur-xl",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-2 data-[state=closed]:slide-out-to-right-full"
            )}
            onOpenChange={(open) => {
              if (!open) dismissToast(toast.id);
            }}
          >
            <div
              className={cn(
                "mt-0.5 rounded-xl p-1.5",
                toast.type === "success" && "bg-teal/15 text-teal",
                toast.type === "error" && "bg-danger/15 text-danger",
                toast.type === "info" && "bg-accent/15 text-accent"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 pr-6">
              <ToastPrimitive.Title className="text-sm font-medium text-foreground">
                {toast.message}
              </ToastPrimitive.Title>
            </div>
            <ToastPrimitive.Close className="absolute right-3 top-3 rounded-lg p-1 text-muted hover:bg-background hover:text-foreground">
              ×
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        );
      })}
      <ToastPrimitive.Viewport className="fixed right-0 top-0 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-[420px]" />
    </ToastPrimitive.Provider>
  );
}
