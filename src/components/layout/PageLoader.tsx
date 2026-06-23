import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface PageLoaderProps {
  label?: string;
  className?: string;
  fullScreen?: boolean;
}

export function PageLoader({
  label = "Loading",
  className,
  fullScreen = true
}: PageLoaderProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-muted",
        fullScreen && "min-h-screen",
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-accent" />
      <p className="text-sm tracking-wide">{label}</p>
    </div>
  );
}
