import { useNavigate } from "react-router-dom";
import { PrimaryButton, ScreenHeader } from "../../components/Primitives";
import { useShift, CURRENT_SHIFT_ID, CURRENT_CAREGIVER_ID } from "./shiftState";
import { useCareEvents } from "../../state/careEventsState";
import { getCaregiverById } from "../../demoData/caregivers";
import { CareEventRecentItem } from "../../components/careEvents/CareEventFormPrimitives";
import {
  MealIcon,
  HydrationIcon,
  BathIcon,
  ActivityIcon,
  MoodIcon,
  NoteIcon,
  CameraIcon,
  AlertIcon,
} from "../../components/icons";

const actions = [
  { key: "MEAL", label: "Comida", Icon: MealIcon, route: "/caregiver/registrar/comida" },
  { key: "HYDRATION", label: "Agua", Icon: HydrationIcon, route: "/caregiver/registrar/agua" },
  { key: "TOILETING", label: "Baño", Icon: BathIcon, route: "/caregiver/registrar/bano" },
  { key: "MOBILITY", label: "Movilidad", Icon: ActivityIcon, route: "/caregiver/registrar/movilidad" },
  { key: "ACTIVITY", label: "Actividad", Icon: ActivityIcon, route: "/caregiver/registrar/actividad" },
  { key: "MOOD", label: "Estado de ánimo", Icon: MoodIcon, route: "/caregiver/registrar/animo" },
  { key: "NOTE", label: "Nota", Icon: NoteIcon, route: "/caregiver/registrar/nota" },
  { key: "PHOTO", label: "Foto", Icon: CameraIcon, route: "/caregiver/registrar/foto" },
] as const;

export function CaregiverActiveShiftPage() {
  const navigate = useNavigate();
  const { finishShift } = useShift();
  const { eventsForShift } = useCareEvents();
  const shiftEvents = eventsForShift(CURRENT_SHIFT_ID);
  const workerName = getCaregiverById(CURRENT_CAREGIVER_ID)?.name;

  function countFor(type: (typeof actions)[number]["key"]) {
    return shiftEvents.filter((e) => e.type === type).length;
  }

  return (
    <div style={{ paddingBottom: "var(--space-6)" }}>
      <ScreenHeader title="Turno activo" subtitle="Carmen Rivera Demo" />
      <div style={{ padding: "0 var(--space-5)" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            marginBottom: "var(--space-5)",
          }}
        >
          {actions.map(({ key, label, Icon, route }) => {
            const count = countFor(key);
            const hasActivity = count > 0;
            return (
              <button
                key={key}
                onClick={() => navigate(route)}
                aria-label={hasActivity ? `${label}, registrado ${count} ${count === 1 ? "vez" : "veces"} este turno` : label}
                style={{
                  position: "relative",
                  aspectRatio: "1",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${hasActivity ? "var(--color-verified)" : "var(--color-border)"}`,
                  background: hasActivity ? "var(--color-verified-bg)" : "var(--color-surface)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: 4,
                }}
              >
                {hasActivity && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      minWidth: 18,
                      height: 18,
                      padding: "0 4px",
                      borderRadius: "var(--radius-full)",
                      background: "var(--color-verified)",
                      color: "white",
                      fontSize: 10,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {count}
                  </span>
                )}
                <Icon size={26} color={hasActivity ? "var(--color-verified)" : "var(--color-ink)"} />
                <span style={{ fontSize: 11, fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
        <p style={{ margin: "0 0 var(--space-5)", fontSize: 12, color: "var(--color-ink-soft)", textAlign: "center" }}>
          Puedes registrar cada tipo de evento las veces que necesites durante el turno.
        </p>

        <button
          onClick={() => navigate("/caregiver/observacion")}
          style={{
            width: "100%",
            minHeight: "var(--tap-min)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-warning)",
            background: "var(--color-warning-bg)",
            color: "var(--color-warning)",
            fontWeight: 600,
            marginBottom: "var(--space-3)",
          }}
        >
          Reportar cambio o preocupación
        </button>

        <button
          onClick={() => navigate("/caregiver/incidente")}
          style={{
            width: "100%",
            minHeight: "var(--tap-min)",
            borderRadius: "var(--radius-md)",
            border: "none",
            background: "var(--color-critical)",
            color: "white",
            fontWeight: 700,
            marginBottom: "var(--space-6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <AlertIcon size={18} color="white" /> Reportar incidente
        </button>

        <h2 style={{ fontSize: "var(--fs-title)", marginBottom: "var(--space-2)" }}>Actividad reciente</h2>
        {shiftEvents.length === 0 ? (
          <p style={{ color: "var(--color-ink-soft)", fontSize: "var(--fs-caption)", marginBottom: "var(--space-6)" }}>
            Aún no has registrado actividad en este turno.
          </p>
        ) : (
          <div style={{ marginBottom: "var(--space-6)" }}>
            {shiftEvents.map((event) => (
              <CareEventRecentItem key={event.id} event={event} workerName={workerName} />
            ))}
          </div>
        )}

        <PrimaryButton
          onClick={() => {
            finishShift();
            navigate("/caregiver/turno-completado");
          }}
        >
          Finalizar turno
        </PrimaryButton>
      </div>
    </div>
  );
}
