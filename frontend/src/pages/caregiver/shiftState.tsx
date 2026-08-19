import { createContext, useContext, useState, type ReactNode } from "react";

export type ShiftStage = "not_started" | "checkin_pin" | "active" | "completed";

/**
 * This prototype models exactly one active shift at a time (Caregiver ->
 * María López Demo, caring for Carmen Rivera Demo). A real backend derives
 * shiftId/recipientId/caregiverId from the authenticated session + the
 * active `shifts`/`assignments` rows (see migrations/009 and 010 in the
 * backend project) -- here they're fixed constants so every CareEvent
 * created during the demo carries consistent, valid-looking foreign keys
 * without inventing a scheduling UI that's out of scope for this gate.
 */
export const CURRENT_SHIFT_ID = "shift-demo-1";
export const CURRENT_RECIPIENT_ID = "res-carmen";
export const CURRENT_CAREGIVER_ID = "cg-maria";

interface ShiftState {
  stage: ShiftStage;
}

interface ShiftContextValue extends ShiftState {
  startCheckIn: () => void;
  confirmPin: () => void;
  finishShift: () => void;
  reset: () => void;
}

const ShiftContext = createContext<ShiftContextValue | null>(null);

export function ShiftProvider({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState<ShiftStage>("not_started");

  const value: ShiftContextValue = {
    stage,
    startCheckIn: () => setStage("checkin_pin"),
    confirmPin: () => setStage("active"),
    finishShift: () => setStage("completed"),
    reset: () => setStage("not_started"),
  };

  return <ShiftContext.Provider value={value}>{children}</ShiftContext.Provider>;
}

export function useShift() {
  const ctx = useContext(ShiftContext);
  if (!ctx) throw new Error("useShift must be used within ShiftProvider");
  return ctx;
}
