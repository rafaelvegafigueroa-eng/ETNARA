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

const ACTIVITIES = ["Caminó", "Se levantó", "Transferencia", "Ejercicio", "Otro"];
const ASSISTANCE = ["Independiente", "Supervisión", "Asistencia parcial", "Asistencia completa"];

export function CaregiverMobilityFormPage() {
  const navigate = useNavigate();
  const { addCareEvent } = useCareEvents();
  const [activity, setActivity] = useState<string | null>(null);
  const [assistance, setAssistance] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const { status, save } = useCareEventSaveFlow();

  const canSave = Boolean(activity && assistance);

  function handleSave() {
    if (!activity || !assistance) return;
    save(() => {
      addCareEvent({
        type: "MOBILITY",
        recipientId: CURRENT_RECIPIENT_ID,
        caregiverId: CURRENT_CAREGIVER_ID,
        shiftId: CURRENT_SHIFT_ID,
        note: note.trim() || undefined,
        data: { activity, assistance },
      });
      window.setTimeout(() => navigate("/caregiver/turno-activo"), 700);
    });
  }

  if (status === "saved") {
    return <CareEventSavedScreen message="✓ Movilidad registrada" />;
  }

  return (
    <div>
      <ScreenHeader title="Movilidad" onBack={() => navigate("/caregiver/turno-activo")} />
      <div style={{ padding: "0 var(--space-5)" }}>
        <CareEventChipGroup label="¿Qué hizo?" options={ACTIVITIES} selected={activity} onSelect={setActivity} />
        <CareEventChipGroup label="Asistencia" options={ASSISTANCE} selected={assistance} onSelect={setAssistance} />
        <CareEventNoteField value={note} onChange={setNote} />
        <PrimaryButton onClick={handleSave} disabled={!canSave || status === "saving"}>
          <SaveButtonLabel status={status}>Guardar</SaveButtonLabel>
        </PrimaryButton>
      </div>
    </div>
  );
}
