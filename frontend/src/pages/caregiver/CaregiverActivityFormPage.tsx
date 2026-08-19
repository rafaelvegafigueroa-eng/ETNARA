import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton, ScreenHeader } from "../../components/Primitives";
import {
  CareEventChipGroup,
  CareEventNoteField,
  CareEventSavedScreen,
  SaveButtonLabel,
  useCareEventSaveFlow,
} from "../../components/careEvents/CareEventFormPrimitives";
import { useCareEvents } from "../../state/careEventsState";
import { CURRENT_CAREGIVER_ID, CURRENT_RECIPIENT_ID, CURRENT_SHIFT_ID } from "./shiftState";

const ACTIVITIES = ["Conversación", "TV/Película", "Música", "Juego", "Ejercicio", "Actividad social", "Otro"];
const DURATIONS = [15, 30, 45, 60];

export function CaregiverActivityFormPage() {
  const navigate = useNavigate();
  const { addCareEvent } = useCareEvents();
  const [activity, setActivity] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const { status, save } = useCareEventSaveFlow();

  const canSave = Boolean(activity);

  function handleSave() {
    if (!activity) return;
    save(() => {
      addCareEvent({
        type: "ACTIVITY",
        recipientId: CURRENT_RECIPIENT_ID,
        caregiverId: CURRENT_CAREGIVER_ID,
        shiftId: CURRENT_SHIFT_ID,
        note: note.trim() || undefined,
        data: { activity, durationMinutes: duration ?? undefined },
      });
      window.setTimeout(() => navigate("/caregiver/turno-activo"), 700);
    });
  }

  if (status === "saved") {
    return <CareEventSavedScreen message="✓ Actividad registrada" />;
  }

  return (
    <div>
      <ScreenHeader title="Actividad" onBack={() => navigate("/caregiver/turno-activo")} />
      <div style={{ padding: "0 var(--space-5)" }}>
        <CareEventChipGroup
          label="Seleccionar actividad rápida"
          options={ACTIVITIES}
          selected={activity}
          onSelect={setActivity}
        />
        <fieldset style={{ border: "none", padding: 0, margin: "0 0 var(--space-5)" }}>
          <legend style={{ fontWeight: 600, marginBottom: "var(--space-2)", padding: 0 }}>
            Duración (opcional)
          </legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {DURATIONS.map((min) => {
              const isSelected = duration === min;
              return (
                <button
                  key={min}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setDuration((cur) => (cur === min ? null : min))}
                  style={{
                    padding: "10px 16px",
                    borderRadius: "var(--radius-full)",
                    border: `1.5px solid ${isSelected ? "var(--color-ink)" : "var(--color-border)"}`,
                    background: isSelected ? "var(--color-ink)" : "var(--color-surface)",
                    color: isSelected ? "white" : "var(--color-ink)",
                    fontWeight: 600,
                    minHeight: "var(--tap-min)",
                  }}
                >
                  {min} min
                </button>
              );
            })}
          </div>
        </fieldset>
        <CareEventNoteField value={note} onChange={setNote} />
        <PrimaryButton onClick={handleSave} disabled={!canSave || status === "saving"}>
          <SaveButtonLabel status={status}>Guardar</SaveButtonLabel>
        </PrimaryButton>
      </div>
    </div>
  );
}
