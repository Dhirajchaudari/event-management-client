export type BentoLayout = "default";

interface BentoPlacement {
  className: string;
  layout: BentoLayout;
}

const BENTO_CYCLE: BentoPlacement[] = [
  { className: "lg:col-span-3 lg:row-span-2", layout: "default" },
  { className: "lg:col-span-3", layout: "default" },
  { className: "lg:col-span-3", layout: "default" },
  { className: "lg:col-span-2", layout: "default" },
  { className: "lg:col-span-2", layout: "default" },
  { className: "lg:col-span-2", layout: "default" }
];

export function getBentoGridClass(eventCount: number): string {
  if (eventCount <= 1) {
    return "mx-auto grid max-w-2xl grid-cols-1 gap-5";
  }

  if (eventCount === 2) {
    return "grid grid-cols-1 gap-5 md:grid-cols-2";
  }

  if (eventCount === 3) {
    return "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3";
  }

  return "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:auto-rows-[minmax(12rem,auto)] lg:grid-flow-dense";
}

export function getBentoPlacement(index: number, eventCount: number): BentoPlacement {
  if (eventCount <= 3) {
    return { className: "", layout: "default" };
  }

  return BENTO_CYCLE[index % BENTO_CYCLE.length] ?? BENTO_CYCLE[0];
}

/** @deprecated Use getBentoGridClass instead */
export const EVENT_BENTO_GRID_CLASS = getBentoGridClass(4);
