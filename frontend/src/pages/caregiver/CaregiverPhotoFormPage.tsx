import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton, ScreenHeader } from "../../components/Primitives";
import { CameraIcon } from "../../components/icons";
import {
  CareEventNoteField,
  CareEventSavedScreen,
  SaveButtonLabel,
  useCareEventSaveFlow,
} from "../../components/careEvents/CareEventFormPrimitives";
import { useCareEvents } from "../../state/careEventsState";
import { CURRENT_CAREGIVER_ID, CURRENT_RECIPIENT_ID, CURRENT_SHIFT_ID } from "./shiftState";

/**
 * Prototype-only: the photo never leaves the browser. It's read into a
 * base64 data URL and kept in the in-memory CareEvents mock store for the
 * rest of the session -- there is no upload, no `stored_files` row, no
 * signed URL. See report section "BACKEND REQUIRED LATER" for what a real
 * implementation needs (multipart upload, virus scan, stored_files +
 * care_event_photos rows, consent_verified_at -- see
 * migrations/007_stored_files.sql and 011_care_events.sql).
 */
export function CaregiverPhotoFormPage() {
  const navigate = useNavigate();
  const { addCareEvent } = useCareEvents();
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { status, save } = useCareEventSaveFlow();

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  function handleFile(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecciona un archivo de imagen.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!photoDataUrl) return;
    save(() => {
      addCareEvent({
        type: "PHOTO",
        recipientId: CURRENT_RECIPIENT_ID,
        caregiverId: CURRENT_CAREGIVER_ID,
        shiftId: CURRENT_SHIFT_ID,
        data: { photoDataUrl, caption: caption.trim() || undefined },
      });
      window.setTimeout(() => navigate("/caregiver/turno-activo"), 900);
    });
  }

  if (status === "saved") {
    return <CareEventSavedScreen message="✓ Foto compartida" />;
  }

  return (
    <div>
      <ScreenHeader title="Foto" onBack={() => navigate("/caregiver/turno-activo")} />
      <div style={{ padding: "0 var(--space-5)" }}>
        {/* Hidden real file inputs -- triggered by the visible buttons below.
            capture="environment" opens the rear camera directly on mobile;
            the gallery input omits it to open the normal picker. */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFile(e.target.files)}
          style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
          aria-hidden="true"
          tabIndex={-1}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files)}
          style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
          aria-hidden="true"
          tabIndex={-1}
        />

        {!photoDataUrl && (
          <div
            style={{
              borderRadius: "var(--radius-md)",
              border: "1.5px dashed var(--color-border)",
              background: "var(--color-surface-muted)",
              padding: "var(--space-8) var(--space-4)",
              textAlign: "center",
              marginBottom: "var(--space-5)",
            }}
          >
            <CameraIcon size={28} color="var(--color-ink-soft)" />
            <p style={{ margin: "var(--space-2) 0 0", color: "var(--color-ink-soft)", fontSize: "var(--fs-caption)" }}>
              Selecciona o toma una foto para compartir
            </p>
          </div>
        )}

        {photoDataUrl && (
          <div style={{ marginBottom: "var(--space-4)" }}>
            <img
              src={photoDataUrl}
              alt="Vista previa de la foto a compartir"
              style={{
                width: "100%",
                maxHeight: 320,
                objectFit: "cover",
                borderRadius: "var(--radius-md)",
                display: "block",
                marginBottom: "var(--space-3)",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                style={{
                  flex: 1,
                  minHeight: "var(--tap-min)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-ink)",
                  fontWeight: 600,
                }}
              >
                Cambiar foto
              </button>
              <button
                type="button"
                onClick={() => setPhotoDataUrl(null)}
                style={{
                  flex: 1,
                  minHeight: "var(--tap-min)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-critical)",
                  background: "var(--color-critical-bg)",
                  color: "var(--color-critical)",
                  fontWeight: 600,
                }}
              >
                Quitar
              </button>
            </div>
          </div>
        )}

        {!photoDataUrl && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: "var(--space-5)" }}>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              style={{
                minHeight: "var(--tap-min)",
                borderRadius: "var(--radius-md)",
                border: "none",
                background: "var(--color-ink)",
                color: "white",
                fontWeight: 600,
                fontSize: "var(--fs-body-lg)",
              }}
            >
              Tomar foto
            </button>
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              style={{
                minHeight: "var(--tap-min)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-ink)",
                fontWeight: 600,
              }}
            >
              Seleccionar foto
            </button>
          </div>
        )}

        {error && (
          <p style={{ color: "var(--color-critical)", fontSize: "var(--fs-caption)", marginBottom: "var(--space-4)" }}>
            {error}
          </p>
        )}

        <CareEventNoteField
          value={caption}
          onChange={setCaption}
          label="Descripción (opcional)"
          placeholder="Ej. Tarde de dominó en el jardín."
        />

        <PrimaryButton onClick={handleSave} disabled={!photoDataUrl || status === "saving"}>
          <SaveButtonLabel status={status}>Guardar</SaveButtonLabel>
        </PrimaryButton>
      </div>
    </div>
  );
}
