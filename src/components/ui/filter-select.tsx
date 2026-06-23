"use client";

import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface FilterSelectOption<T extends string> {
  value: T;
  label: string;
}

interface FilterSelectProps<T extends string> {
  value: T;
  options: FilterSelectOption<T>[];
  onValueChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}

export function FilterSelect<T extends string>({
  value,
  options,
  onValueChange,
  ariaLabel,
  className
}: FilterSelectProps<T>): React.JSX.Element {
  return (
    <Select.Root value={value} onValueChange={(nextValue) => onValueChange(nextValue as T)}>
      <Select.Trigger
        aria-label={ariaLabel}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-border/80 bg-background/60 px-4 text-left text-sm text-foreground shadow-inner shadow-black/10 transition-colors",
          "focus-visible:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/20",
          className
        )}
      >
        <span className="min-w-0 flex-1 truncate">
          <Select.Value />
        </span>
        <Select.Icon className="flex h-4 w-4 shrink-0 items-center justify-center text-muted">
          <ChevronDown className="h-4 w-4" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          align="start"
          className="z-50 overflow-hidden rounded-2xl border border-border/80 bg-surface p-1.5 shadow-xl"
          style={{ width: "var(--radix-select-trigger-width)" }}
        >
          <Select.Viewport className="p-0.5">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-xl py-2.5 pl-8 pr-3 text-sm outline-none",
                  "text-foreground focus:bg-background data-[highlighted]:bg-background"
                )}
              >
                <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                  <Check className="h-4 w-4 text-accent" />
                </Select.ItemIndicator>
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
