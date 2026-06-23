"use client";

import { EventCard } from "@/components/events/EventCard";
import { getBentoGridClass, getBentoPlacement } from "@/lib/event-bento";
import type { EventRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

interface EventBentoGridProps {
  events: EventRecord[];
  isAdmin?: boolean;
  onEdit: (event: EventRecord) => void;
  onDelete: (event: EventRecord) => void;
  onExportPdf: (event: EventRecord) => void;
  onUpdateStatus: (event: EventRecord) => void;
  onViewAttendees: (event: EventRecord) => void;
  onSubmitForApproval?: (event: EventRecord) => void;
  onApprove?: (event: EventRecord) => void;
  onReject?: (event: EventRecord) => void;
  reviewLoading?: boolean;
}

export function EventBentoGrid({
  events,
  isAdmin = false,
  onEdit,
  onDelete,
  onExportPdf,
  onUpdateStatus,
  onViewAttendees,
  onSubmitForApproval,
  onApprove,
  onReject,
  reviewLoading = false
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
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
            onExportPdf={onExportPdf}
            onUpdateStatus={onUpdateStatus}
            onViewAttendees={onViewAttendees}
            onSubmitForApproval={onSubmitForApproval}
            onApprove={onApprove}
            onReject={onReject}
            reviewLoading={reviewLoading}
          />
        );
      })}
    </div>
  );
}
