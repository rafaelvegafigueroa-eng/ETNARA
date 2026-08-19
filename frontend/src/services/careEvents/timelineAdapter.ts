import type { DemoTimelineEvent, TimelineEventType } from "../../demoData/timeline";
import type { CareEvent } from "./types";

/**
 * Bridges the new, structured CareEvent model to the existing
 * `DemoTimelineEvent` shape that `<Timeline>` (Family "Hoy", Agency
 * "Timeline" tab) already knows how to render. This means zero changes to
 * the Timeline component's rendering logic -- only `iconByType` gained
 * three new keys (toileting, mobility, note) in `demoData/timeline.ts` and
 * `components/Timeline.tsx`.
 */

function formatTimeLabel(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function detailForEvent(event: CareEvent): string {
  switch (event.type) {
    case "MEAL":
      return `${event.data.mealType} · ${event.data.amount}`;
    case "HYDRATION":
      return `${event.data.amountOz} oz de agua`;
    case "TOILETING":
      return event.data.assistance ? `${event.data.kind} · ${event.data.assistance}` : event.data.kind;
    case "MOBILITY":
      return `${event.data.activity} · ${event.data.assistance}`;
    case "ACTIVITY":
      return event.data.durationMinutes
        ? `${event.data.activity} · ${event.data.durationMinutes} min`
        : event.data.activity;
    case "MOOD":
      return event.data.moodLabel;
    case "NOTE":
      return event.data.text.length > 140 ? `${event.data.text.slice(0, 140)}…` : event.data.text;
    case "PHOTO":
      return event.data.caption?.trim() || "Foto compartida durante el turno.";
  }
}

function titleForEvent(event: CareEvent): string {
  switch (event.type) {
    case "MEAL":
      return event.data.mealType || "Comida";
    case "HYDRATION":
      return "Hidratación";
    case "TOILETING":
      return "Baño";
    case "MOBILITY":
      return "Movilidad";
    case "ACTIVITY":
      return "Actividad";
    case "MOOD":
      return "Estado de ánimo";
    case "NOTE":
      return "Nota de cuidado";
    case "PHOTO":
      return "Foto compartida";
  }
}

const timelineTypeByEventType: Record<CareEvent["type"], TimelineEventType> = {
  MEAL: "meal",
  HYDRATION: "hydration",
  TOILETING: "toileting",
  MOBILITY: "mobility",
  ACTIVITY: "activity",
  MOOD: "mood",
  NOTE: "note",
  PHOTO: "photo",
};

export function mapCareEventToTimelineEvent(
  event: CareEvent,
  workerName?: string
): DemoTimelineEvent {
  return {
    id: event.id,
    type: timelineTypeByEventType[event.type],
    time: formatTimeLabel(event.occurredAt),
    title: titleForEvent(event),
    detail: event.note?.trim() ? `${detailForEvent(event)} — "${event.note.trim()}"` : detailForEvent(event),
    worker: workerName,
    hasPhoto: event.type === "PHOTO",
    photoSrc: event.type === "PHOTO" ? event.data.photoDataUrl : undefined,
    occurredAtMinutes: minutesSinceMidnight(new Date(event.occurredAt)),
  };
}

function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** Parses the app's existing static demo strings ("8:45 AM") into
 * minutes-since-midnight so they can be merged and sorted alongside live
 * events, which only carry real timestamps. */
function parseDisplayTimeToMinutes(display: string): number {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(display.trim());
  if (!match) return 0;
  let hours = Number(match[1]) % 12;
  const minutes = Number(match[2]);
  if (match[3].toUpperCase() === "PM") hours += 12;
  return hours * 60 + minutes;
}

/**
 * Merges the pre-scripted "story of the day" demo events with live
 * CareEvents registered during this session, in ascending chronological
 * order -- matching how `demoTimelineToday` already reads (check-in first,
 * check-out last). This is the ordering Family and Agency expect; it is
 * intentionally the OPPOSITE of the "most recent first" order used by
 * Caregiver's own "Actividad reciente" list, which is a different surface
 * with a different job (a live activity log, not a day's story).
 */
export function mergeTimelineEvents(
  historical: DemoTimelineEvent[],
  live: DemoTimelineEvent[]
): DemoTimelineEvent[] {
  const withMinutes = [
    ...historical.map((e) => ({ ...e, occurredAtMinutes: e.occurredAtMinutes ?? parseDisplayTimeToMinutes(e.time) })),
    ...live,
  ];
  return withMinutes.sort((a, b) => (a.occurredAtMinutes ?? 0) - (b.occurredAtMinutes ?? 0));
}
