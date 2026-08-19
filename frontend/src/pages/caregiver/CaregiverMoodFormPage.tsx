import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScreenHeader } from "../../components/Primitives";
import {
  CareEventNoteField,
  CareEventSavedScreen,
  useCareEventSaveFlow,
} from "../../components/careEvents/CareEventFormPrimitives";
import { useCareEvents } from "../../state/careEventsState";
import { CURRENT_CAREGIVER_ID, CURRENT_RECIPIENT_ID, CURRENT_SHIFT_ID } from "./shiftState";

const MOODS = [
  { key: "alegre", emoji: "🙂", label: "Alegre" },
  { key: "tranquilo", emoji: "😌", label: "Tranquilo" },
  { key: "neutral", emoji: "😐", label: "Neutral" },
  { key: "preocupado", emoji: "😟", label: "Preocupado" },
  { key: "triste", emoji: "😢", label: "Triste" },
  { key: "irritable", emoji: "😠", label: "Irritable" },
];

/**
 * Deliberately the fastest form in the app: tapping a mood saves
 * immediately (no separate "Guardar" step) -- per spec, mood must be
 * "extremadamente rápida". A note can optionally be added first; whatever
 * is in the note field travels with whichever mood is tapped next.
 */
export function CaregiverMoodFormPage() {
  const navigate = useNavigate();
  const { addCareEvent } = useCareEvents();
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const { status, save } = useCareEventSaveFlow(250);

  function handleSelect(mood: (typeof MOODS)[number]) {
    save(() => {
      addCareEvent({
        type: "MOOD",
        recipientId: CURRENT_RECIPIENT_ID,
        caregiverId: CURRENT_CAREGIVER_ID,
        shiftId: CURRENT_SHIFT_ID,
        note: note.trim() || undefined,
        data: { mood: mood.key, moodLabel: mood.label },
      });
      window.setTimeout(() => navigate("/caregiver/turno-activo"), 600);
    });
  }

  if (status === "saved") {
    return <CareEventSavedScreen message="✓ Estado de ánimo registrado" />;
  }

  return (
    <div>
      <ScreenHeader title="¿Cómo estuvo?" onBack={() => navigate("/caregiver/turno-activo")} />
      <div style={{ padding: "0 var(--space-5)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "var(--space-4)" }}>
          {MOODS.map((mood) => (
            <button
              key={mood.key}
              type="button"
              disabled={status === "saving"}
              onClick={() => handleSelect(mood)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                textAlign: "left",
                padding: "var(--space-3) var(--space-4)",
                borderRadius: "var(--radius-md)",
                border: "1.5px solid var(--color-border)",
                background: "var(--color-surface)",
                fontWeight: 600,
                fontSize: "var(--fs-body)",
                minHeight: "var(--tap-min)",
              }}
            >
              <span aria-hidden="true" style={{ fontSize: 24, lineHeight: 1 }}>
                {mood.emoji}
              </span>
              {mood.label}
            </button>
          ))}
        </div>

        {!showNote && (
          <button
            type="button"
            onClick={() => setShowNote(true)}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-ink-soft)",
              fontWeight: 600,
              fontSize: "var(--fs-caption)",
              padding: "var(--space-2) 0",
            }}
          >
            + Agregar nota (opcional)
          </button>
        )}
        {showNote && <CareEventNoteField value={note} onChange={setNote} />}
      </div>
    </div>
  );
}
