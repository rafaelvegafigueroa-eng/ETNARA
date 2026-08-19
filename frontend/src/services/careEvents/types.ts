/**
 * Frontend CareEvent model.
 *
 * Mirrors the shape of the real backend's `care_events` table (see
 * migrations/011_care_events.sql in etnara-care-backend-current):
 * organization_id / shift_id / care_recipient_id /
 * organization_worker_membership_id / care_event_type / occurred_at /
 * note_text / structured_data. Field names here are camelCase and slightly
 * simplified (no organizationId yet -- this prototype has a single demo
 * organization) so the eventual API integration is a rename/passthrough,
 * not a redesign.
 *
 * `data` is the frontend equivalent of the backend's `structured_data`
 * jsonb column -- typed per event type here (the backend leaves it
 * intentionally loose; we can afford to be stricter on the client since we
 * control every writer).
 */

export type CareEventType =
  | "MEAL"
  | "HYDRATION"
  | "TOILETING"
  | "MOBILITY"
  | "ACTIVITY"
  | "MOOD"
  | "NOTE"
  | "PHOTO";

export interface MealEventData {
  mealType: string; // "Desayuno" | "Almuerzo" | "Cena" | "Merienda"
  amount: string; // "Todo" | "Casi todo" | "La mitad" | "Poco" | "Nada"
}

export interface HydrationEventData {
  amountOz: number;
}

export interface ToiletingEventData {
  kind: string; // "Orina" | "Evacuación" | "Ambos"
  assistance?: string; // "Independiente" | "Con asistencia"
}

export interface MobilityEventData {
  activity: string; // "Caminó" | "Se levantó" | "Transferencia" | "Ejercicio" | "Otro"
  assistance: string; // "Independiente" | "Supervisión" | "Asistencia parcial" | "Asistencia completa"
}

export interface ActivityEventData {
  activity: string;
  durationMinutes?: number;
}

export interface MoodEventData {
  mood: string; // key into MOOD_OPTIONS
  moodLabel: string; // display label, denormalized for easy timeline rendering
}

export interface NoteEventData {
  text: string;
}

export interface PhotoEventData {
  photoDataUrl: string;
  caption?: string;
}

export type CareEventDataMap = {
  MEAL: MealEventData;
  HYDRATION: HydrationEventData;
  TOILETING: ToiletingEventData;
  MOBILITY: MobilityEventData;
  ACTIVITY: ActivityEventData;
  MOOD: MoodEventData;
  NOTE: NoteEventData;
  PHOTO: PhotoEventData;
};

interface CareEventBase<T extends CareEventType> {
  id: string;
  type: T;
  recipientId: string;
  caregiverId: string;
  shiftId: string;
  /** ISO 8601 timestamp. Client-generated in this mock phase -- a real
   * backend would assign this server-side (see backend-architecture-plan.md
   * notes on never trusting client-supplied timestamps for audit data). */
  occurredAt: string;
  note?: string;
  data: CareEventDataMap[T];
}

export type CareEvent = {
  [T in CareEventType]: CareEventBase<T>;
}[CareEventType];

export type CreateCareEventInput = {
  [T in CareEventType]: Omit<CareEventBase<T>, "id" | "occurredAt">;
}[CareEventType];

export const CARE_EVENT_LABELS: Record<CareEventType, string> = {
  MEAL: "Comida",
  HYDRATION: "Hidratación",
  TOILETING: "Baño",
  MOBILITY: "Movilidad",
  ACTIVITY: "Actividad",
  MOOD: "Estado de ánimo",
  NOTE: "Nota",
  PHOTO: "Foto",
};
