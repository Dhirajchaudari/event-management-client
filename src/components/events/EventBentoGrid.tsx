"use client";

import { EventCard } from "@/components/events/EventCard";
import { getBentoGridClass, getBentoPlacement } from "@/lib/event-bento";
import type { EventRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EventBentoGridProps {
  events: EventRecord[];
  onEdit: (event: EventRecord) => void;
  onDelete: (event: EventRecord) => void;
  onExportPdf: (event: EventRecord) => void;
  onUpdateStatus: (event: EventRecord) => void;
  onViewAttendees: (event: EventRecord) => void;
}

export function EventBentoGrid({
  events,
  onEdit,
  onDelete,
  onExportPdf,
  onUpdateStatus,
  onViewAttendees
}: EventBentoGridProps): React.JSX.Element {
  const gridClass = getBentoGridClass(events.length);

  return (
    <div className={gridClass}>
      {events.map((event, index) => {
        const { className, layout } = getBentoPlacement(index, events.length);

        return (
          <EventCard
            key={event.id}
            event={event}
            layout={layout}
            className={cn(className)}
            onEdit={onEdit}
            onDelete={onDelete}
            onExportPdf={onExportPdf}
            onUpdateStatus={onUpdateStatus}
            onViewAttendees={onViewAttendees}
          />
        );
      })}
    </div>
  );
}
