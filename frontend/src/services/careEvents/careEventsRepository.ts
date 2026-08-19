import type { CareEvent, CreateCareEventInput } from "./types";

/**
 * MOCK REPOSITORY -- the only seam that changes when this connects to a
 * real API.
 *
 * Today: an in-memory array, reset on page reload. Later: `createCareEvent`
 * becomes `POST /organizations/:orgId/care-events` and `listCareEvents`
 * becomes `GET /care-recipients/:id/timeline` (see the real backend's
 * careEvents/timeline module names in backend-architecture-plan.md) --
 * every call site in this app already goes through these two functions, so
 * swapping the body of each for a `fetch`/API-client call is the entire
 * migration. No component should import from here directly; go through
 * `useCareEvents()` in `src/state/careEventsState.tsx` instead, which is
 * the reactive (React state) wrapper around this store.
 *
 * Deliberately NOT here: fetch/axios calls, API URLs, auth headers,
 * optimistic-update rollback logic. Those belong to the real implementation
 * of this same module, not to the mock.
 */

let store: CareEvent[] = [];
let nextId = 1;

export function createCareEvent(input: CreateCareEventInput): CareEvent {
  const event = {
    ...input,
    id: `evt-local-${nextId++}`,
    occurredAt: new Date().toISOString(),
  } as CareEvent;
  store = [event, ...store];
  return event;
}

export function listCareEvents(filter?: { recipientId?: string; shiftId?: string }): CareEvent[] {
  let result = store;
  if (filter?.recipientId) result = result.filter((e) => e.recipientId === filter.recipientId);
  if (filter?.shiftId) result = result.filter((e) => e.shiftId === filter.shiftId);
  return result;
}

/** Test/demo-reset helper only -- not part of the eventual API surface. */
export function resetCareEvents(): void {
  store = [];
  nextId = 1;
}
