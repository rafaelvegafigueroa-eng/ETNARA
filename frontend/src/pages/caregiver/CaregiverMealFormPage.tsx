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

const mealTypes = ["Desayuno", "Almuerzo", "Cena", "Merienda"];
const amounts = ["Todo", "Casi todo", "La mitad", "Poco", "Nada"];

export function CaregiverMealFormPage() {
  const navigate = useNavigate();
  const { addCareEvent } = useCareEvents();
  const [type, setType] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const { status, save } = useCareEventSaveFlow();

  const canSave = Boolean(type && amount);

  function handleSave() {
    if (!type || !amount) return;
    save(() => {
      addCareEvent({
        type: "MEAL",
        recipientId: CURRENT_RECIPIENT_ID,
        caregiverId: CURRENT_CAREGIVER_ID,
        shiftId: CURRENT_SHIFT_ID,
        note: note.trim() || undefined,
        data: { mealType: type, amount },
      });
      window.setTimeout(() => navigate("/caregiver/turno-activo"), 900);
    });
  }

  if (status === "saved") {
    return <CareEventSavedScreen message="✓ Comida registrada" />;
  }

  return (
    <div>
      <ScreenHeader title="Comida" onBack={() => navigate("/caregiver/turno-activo")} />
      <div style={{ padding: "0 var(--space-5)" }}>
        <CareEventChipGroup label="¿Qué comida fue?" options={mealTypes} selected={type} onSelect={setType} />
        <CareEventChipGroup label="¿Cuánto comió?" options={amounts} selected={amount} onSelect={setAmount} />
        <CareEventNoteField value={note} onChange={setNote} />
        <PrimaryButton onClick={handleSave} disabled={!canSave || status === "saving"}>
          <SaveButtonLabel status={status}>Guardar</SaveButtonLabel>
        </PrimaryButton>
      </div>
    </div>
  );
}
