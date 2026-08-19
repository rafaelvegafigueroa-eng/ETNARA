import { createContext, useContext, useState, type ReactNode } from "react";
import {
  createCareEvent as repoCreateCareEvent,
  listCareEvents as repoListCareEvents,
} from "../services/careEvents/careEventsRepository";
import { mapCareEventToTimelineEvent, mergeTimelineEvents } from "../services/careEvents/timelineAdapter";
import type { CareEvent, CreateCareEventInput } from "../services/careEvents/types";
import type { DemoTimelineEvent } from "../demoData/timeline";
import { demoTimelineToday } from "../demoData/timeline";
import { getCaregiverById } from "../demoData/caregivers";
import { CURRENT_RECIPIENT_ID, CURRENT_CAREGIVER_ID } from "../pages/caregiver/shiftState";

/**
 * Single shared source of truth for CareEvents across all three surfaces
 * (Caregiver logs them, Family/Agency read them) -- this is the "no quiero
 * tres copias desconectadas de demo data" requirement. It sits on top of
 * `services/careEvents/careEventsRepository.ts`: the repository is the
 * plain-data seam that gets swapped for a real API client later; this
 * Context is only the React-reactivity wrapper around it (so components
 * re-render when a new event is added). React Context + useState is
 * sufficient at this scale -- no Redux/Zustand.
 */
interface CareEventsContextValue {
  events: CareEvent[];
  addCareEvent: (input: CreateCareEventInput) => CareEvent;
  eventsForRecipient: (recipientId: string) => CareEvent[];
  eventsForShift: (shiftId: string) => CareEvent[];
}

const CareEventsContext = createContext<CareEventsContextValue | null>(null);

export function CareEventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CareEvent[]>(() => repoListCareEvents());

  function addCareEvent(input: CreateCareEventInput): CareEvent {
    const created = repoCreateCareEvent(input);
    setEvents((prev) => [created, ...prev]);
    return created;
  }

  function eventsForRecipient(recipientId: string) {
    return events.filter((e) => e.recipientId === recipientId);
  }

  function eventsForShift(shiftId: string) {
    return events.filter((e) => e.shiftId === shiftId);
  }

  return (
    <CareEventsContext.Provider value={{ events, addCareEvent, eventsForRecipient, eventsForShift }}>
      {children}
    </CareEventsContext.Provider>
  );
}

export function useCareEvents() {
  const ctx = useContext(CareEventsContext);
  if (!ctx) throw new Error("useCareEvents must be used within CareEventsProvider");
  return ctx;
}

/**
 * Family/Agency synchronization helper: returns this resident's timeline as
 * the pre-scripted "story of the day" (only meaningful for Carmen, the one
 * resident that narrative was written for) merged with any live CareEvents
 * registered this session, in ascending chronological order.
 *
 * For any other resident, there is no pre-scripted narrative -- returning
 * `demoTimelineToday` for them would be wrong (it was Carmen's day, not
 * theirs). This also fixes a pre-existing bug where Agency's "Timeline" tab
 * showed Carmen's script for every resident regardless of which profile was
 * open.
 */
export function useResidentTimeline(recipientId: string): DemoTimelineEvent[] {
  const { eventsForRecipient } = useCareEvents();
  const workerName = getCaregiverById(CURRENT_CAREGIVER_ID)?.name;
  const live = eventsForRecipient(recipientId).map((e) => mapCareEventToTimelineEvent(e, workerName));
  const historical = recipientId === CURRENT_RECIPIENT_ID ? demoTimelineToday : [];
  return mergeTimelineEvents(historical, live);
}
