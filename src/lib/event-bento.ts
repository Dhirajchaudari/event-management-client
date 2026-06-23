export type BentoLayout = "default" | "hero";

interface BentoPlacement {
  className: string;
  layout: BentoLayout;
}

export function getBentoGridClass(eventCount: number): string {
  if (eventCount <= 1) {
    return "mx-auto grid max-w-3xl grid-cols-1 gap-5";
  }

  if (eventCount <= 3) {
    return "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3";
  }

  return "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3";
}

export function getBentoPlacement(index: number, eventCount: number): BentoPlacement {
  if (eventCount >= 4 && index === 0) {
    return { className: "xl:col-span-3", layout: "hero" };
  }

  return { className: "", layout: "default" };
}
