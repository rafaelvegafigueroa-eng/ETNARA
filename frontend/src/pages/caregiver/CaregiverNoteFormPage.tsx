import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton, ScreenHeader } from "../../components/Primitives";
import {
  CareEventSavedScreen,
  SaveButtonLabel,
  useCareEventSaveFlow,
} from "../../components/careEvents/CareEventFormPrimitives";
import { useCareEvents } from "../../state/careEventsState";
import { CURRENT_CAREGIVER_ID, CURRENT_RECIPIENT_ID, CURRENT_SHIFT_ID } from "./shiftState";

const MAX_LENGTH = 500;

export function CaregiverNoteFormPage() {
  const navigate = useNavigate();
  const { addCareEvent } = useCareEvents();
  const [text, setText] = useState("");
  const { status, save } = useCareEventSaveFlow();

  const canSave = text.trim().length > 0;

  function handleSave() {
    const trimmed = text.trim();
    if (!trimmed) return;
    save(() => {
      addCareEvent({
        type: "NOTE",
        recipientId: CURRENT_RECIPIENT_ID,
        caregiverId: CURRENT_CAREGIVER_ID,
        shiftId: CURRENT_SHIFT_ID,
        data: { text: trimmed },
      });
      window.setTimeout(() => navigate("/caregiver/turno-activo"), 700);
    });
  }

  if (status === "saved") {
    return <CareEventSavedScreen message="✓ Nota guardada" />;
  }

  return (
    <div>
      <ScreenHeader title="Nota de cuidado" onBack={() => navigate("/caregiver/turno-activo")} />
      <div style={{ padding: "0 var(--space-5)" }}>
        <label htmlFor="care-note-text" style={{ display: "block", fontWeight: 600, marginBottom: "var(--space-2)" }}>
          ¿Qué quieres registrar?
        </label>
        <textarea
          id="care-note-text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
          placeholder="Escribe cualquier detalle que la familia o el equipo debería saber…"
          rows={8}
          maxLength={MAX_LENGTH}
          style={{
            width: "100%",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            padding: "var(--space-3)",
            fontSize: "var(--fs-body)",
            fontFamily: "var(--font-body)",
            resize: "none",
            marginBottom: 4,
          }}
        />
        <p style={{ margin: "0 2px var(--space-5)", fontSize: 12, color: "var(--color-ink-soft)", textAlign: "right" }}>
          {text.length}/{MAX_LENGTH}
        </p>
        <PrimaryButton onClick={handleSave} disabled={!canSave || status === "saving"}>
          <SaveButtonLabel status={status}>Guardar nota</SaveButtonLabel>
        </PrimaryButton>
      </div>
    </div>
  );
}
