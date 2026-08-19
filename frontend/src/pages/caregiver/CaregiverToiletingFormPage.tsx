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

const KINDS = ["Orina", "Evacuación", "Ambos"];
const ASSISTANCE = ["Independiente", "Con asistencia"];

export function CaregiverToiletingFormPage() {
  const navigate = useNavigate();
  const { addCareEvent } = useCareEvents();
  const [kind, setKind] = useState<string | null>(null);
  const [assistance, setAssistance] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const { status, save } = useCareEventSaveFlow();

  const canSave = Boolean(kind);

  function handleSave() {
    if (!kind) return;
    save(() => {
      addCareEvent({
        type: "TOILETING",
        recipientId: CURRENT_RECIPIENT_ID,
        caregiverId: CURRENT_CAREGIVER_ID,
        shiftId: CURRENT_SHIFT_ID,
        note: note.trim() || undefined,
        data: { kind, assistance: assistance ?? undefined },
      });
      window.setTimeout(() => navigate("/caregiver/turno-activo"), 700);
    });
  }

  if (status === "saved") {
    return <CareEventSavedScreen message="✓ Baño registrado" />;
  }

  return (
    <div>
      <ScreenHeader title="Baño" onBack={() => navigate("/caregiver/turno-activo")} />
      <div style={{ padding: "0 var(--space-5)" }}>
        <CareEventChipGroup label="Tipo" options={KINDS} selected={kind} onSelect={setKind} />
        <CareEventChipGroup
          label="Asistencia (opcional)"
          options={ASSISTANCE}
          selected={assistance}
          onSelect={(v) => setAssistance((cur) => (cur === v ? null : v))}
        />
        <CareEventNoteField value={note} onChange={setNote} />
        <PrimaryButton onClick={handleSave} disabled={!canSave || status === "saving"}>
          <SaveButtonLabel status={status}>Guardar</SaveButtonLabel>
        </PrimaryButton>
      </div>
    </div>
  );
}
