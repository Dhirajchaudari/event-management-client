import { jsPDF } from "jspdf";

import { formatEventDate } from "@/lib/format";
import { getEventStatusLabel } from "@/lib/event-status";
import type { EventRecord } from "@/lib/types";

const PAGE_WIDTH = 210;
const MARGIN = 18;

async function loadSpeakerImage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function drawLabelValue(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number
): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 130);
  doc.text(label.toUpperCase(), x, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 38);
  doc.text(value, x, y + 6);
  return y + 16;
}

export async function exportEventPdf(event: EventRecord): Promise<void> {
  const doc = new jsPDF();

  doc.setFillColor(8, 8, 12);
  doc.rect(0, 0, PAGE_WIDTH, 52, "F");

  doc.setFillColor(232, 165, 75);
  doc.rect(0, 52, PAGE_WIDTH, 2.5, "F");

  doc.setTextColor(244, 244, 245);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  const titleLines = doc.splitTextToSize(event.name, PAGE_WIDTH - MARGIN * 2);
  doc.text(titleLines, MARGIN, 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(161, 161, 170);
  doc.text("Onference Event Studio", MARGIN, 44);

  let y = 68;

  doc.setFillColor(248, 248, 250);
  doc.roundedRect(MARGIN, y, PAGE_WIDTH - MARGIN * 2, 58, 4, 4, "F");

  const speakerImage = event.speakerPhotoUrl ? await loadSpeakerImage(event.speakerPhotoUrl) : null;
  const speakerX = MARGIN + 8;
  const speakerY = y + 10;

  if (speakerImage) {
    doc.addImage(speakerImage, "JPEG", speakerX, speakerY, 28, 28);
  } else {
    doc.setFillColor(232, 165, 75);
    doc.setDrawColor(232, 165, 75);
    doc.circle(speakerX + 14, speakerY + 14, 14, "F");
    doc.setTextColor(26, 18, 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    const initials = event.speakerName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
    doc.text(initials, speakerX + 14, speakerY + 17, { align: "center" });
  }

  doc.setTextColor(30, 30, 38);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(event.speakerName, speakerX + 38, speakerY + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 100);
  doc.text(event.speakerDesignation, speakerX + 38, speakerY + 20);

  y += 72;

  y = drawLabelValue(doc, "Event date", formatEventDate(event.date), MARGIN, y);
  y = drawLabelValue(doc, "Status", getEventStatusLabel(event.status), MARGIN, y);
  y = drawLabelValue(doc, "Attendees", String(event.attendeeCount), MARGIN, y);

  doc.setDrawColor(230, 230, 235);
  doc.line(MARGIN, y + 4, PAGE_WIDTH - MARGIN, y + 4);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(140, 140, 150);
  doc.text(`Generated ${new Date().toLocaleString("en-IN")}`, MARGIN, 285);

  doc.save(`${event.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-event.pdf`);
}
