import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton, ScreenHeader } from "../../components/Primitives";
import {
  CareEventNoteField,
  CareEventSavedScreen,
  SaveButtonLabel,
  useCareEventSaveFlow,
} from "../../components/careEvents/CareEventFormPrimitives";
import { useCareEvents } from "../../state/careEventsState";
import { CURRENT_CAREGIVER_ID, CURRENT_RECIPIENT_ID, CURRENT_SHIFT_ID } from "./shiftState";

const QUICK_AMOUNTS = [4, 8, 12, 16];
const STEP_OZ = 4;
const MIN_OZ = 0;
const MAX_OZ = 48;

export function CaregiverHydrationFormPage() {
  const navigate = useNavigate();
  const { addCareEvent } = useCareEvents();
  const [amount, setAmount] = useState(8);
  const [note, setNote] = useState("");
  const { status, save } = useCareEventSaveFlow();

  function handleSave() {
    if (amount <= 0) return;
    save(() => {
      addCareEvent({
        type: "HYDRATION",
        recipientId: CURRENT_RECIPIENT_ID,
        caregiverId: CURRENT_CAREGIVER_ID,
        shiftId: CURRENT_SHIFT_ID,
        note: note.trim() || undefined,
        data: { amountOz: amount },
      });
      window.setTimeout(() => navigate("/caregiver/turno-activo"), 700);
    });
  }

  if (status === "saved") {
    return <CareEventSavedScreen message="✓ Hidratación registrada" />;
  }

  return (
    <div>
      <ScreenHeader title="Agua" onBack={() => navigate("/caregiver/turno-activo")} />
      <div style={{ padding: "0 var(--space-5)" }}>
        <p style={{ fontWeight: 600, marginBottom: "var(--space-3)" }}>Cantidad</p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "var(--space-5)",
            marginBottom: "var(--space-5)",
          }}
        >
          <button
            type="button"
            aria-label="Restar 4 onzas"
            onClick={() => setAmount((a) => Math.max(MIN_OZ, a - STEP_OZ))}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              fontSize: 26,
              fontWeight: 600,
              color: "var(--color-ink)",
            }}
          >
            −
          </button>
          <div style={{ minWidth: 96, textAlign: "center" }} aria-live="polite">
            <span style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 600 }}>{amount}</span>
            <span style={{ fontSize: "var(--fs-body)", color: "var(--color-ink-soft)", marginLeft: 6 }}>oz</span>
          </div>
          <button
            type="button"
            aria-label="Sumar 4 onzas"
            onClick={() => setAmount((a) => Math.min(MAX_OZ, a + STEP_OZ))}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
              fontSize: 26,
              fontWeight: 600,
              color: "var(--color-ink)",
            }}
          >
            +
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8, marginBottom: "var(--space-5)" }}>
          {QUICK_AMOUNTS.map((oz) => (
            <button
              key={oz}
              type="button"
              aria-pressed={amount === oz}
              onClick={() => setAmount(oz)}
              style={{
                padding: "10px 18px",
                borderRadius: "var(--radius-full)",
                border: `1.5px solid ${amount === oz ? "var(--color-ink)" : "var(--color-border)"}`,
                background: amount === oz ? "var(--color-ink)" : "var(--color-surface)",
                color: amount === oz ? "white" : "var(--color-ink)",
                fontWeight: 600,
                minHeight: "var(--tap-min)",
              }}
            >
              {oz} oz
            </button>
          ))}
        </div>

        <CareEventNoteField value={note} onChange={setNote} />
        <PrimaryButton onClick={handleSave} disabled={amount <= 0 || status === "saving"}>
          <SaveButtonLabel status={status}>Registrar hidratación</SaveButtonLabel>
        </PrimaryButton>
      </div>
    </div>
  );
}
