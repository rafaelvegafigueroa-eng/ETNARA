import { useState } from "react";
import type { ReactNode } from "react";
import { CheckIcon } from "../icons";
import type { CareEvent } from "../../services/careEvents/types";
import { mapCareEventToTimelineEvent } from "../../services/careEvents/timelineAdapter";
import { iconByType } from "../Timeline";

/**
 * Small, reusable pieces shared by the 8 Care Event forms. Deliberately
 * NOT one giant generic "CareEventFormLayout" that tries to abstract every
 * field type (chips vs. a numeric stepper vs. an emoji list vs. a file
 * input) -- each form keeps its own page component (matching the existing
 * one-file-per-screen convention) and composes these primitives plus the
 * already-existing ScreenHeader/PrimaryButton/Card.
 */

/* ---------------------------------------------------------------------- */
/* Single-select chip group -- used by Meal, Toileting, Mobility, Activity */
/* ---------------------------------------------------------------------- */
export function CareEventChipGroup({
  label,
  options,
  selected,
  onSelect,
}: {
  label?: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <fieldset style={{ border: "none", padding: 0, margin: "0 0 var(--space-5)" }}>
      {label && (
        <legend style={{ fontWeight: 600, marginBottom: "var(--space-2)", padding: 0 }}>{label}</legend>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((option) => {
          const isSelected = selected === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(option)}
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
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ---------------------------------------------------------------------- */
/* Optional note textarea -- used by all 8 forms                          */
/* ---------------------------------------------------------------------- */
export function CareEventNoteField({
  value,
  onChange,
  placeholder = "Añade un detalle si quieres…",
  label = "Nota (opcional)",
  maxLength,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  maxLength?: number;
}) {
  const fieldId = "care-event-note";
  return (
    <div style={{ marginBottom: "var(--space-5)" }}>
      <label htmlFor={fieldId} style={{ display: "block", fontWeight: 600, marginBottom: "var(--space-2)" }}>
        {label}
      </label>
      <textarea
        id={fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        rows={3}
        maxLength={maxLength}
        style={{
          width: "100%",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border)",
          padding: "var(--space-3)",
          fontSize: "var(--fs-body)",
          fontFamily: "var(--font-body)",
          resize: "none",
        }}
      />
      {maxLength && (
        <p style={{ margin: "4px 2px 0", fontSize: 12, color: "var(--color-ink-soft)", textAlign: "right" }}>
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Confirmation screen shown after a successful save                      */
/* ---------------------------------------------------------------------- */
export function CareEventSavedScreen({ message }: { message: string }) {
  return (
    <div style={{ padding: "var(--space-8) var(--space-5)", textAlign: "center" }} role="status">
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--color-verified-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto var(--space-4)",
        }}
      >
        <CheckIcon size={24} color="var(--color-verified)" />
      </div>
      <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-display)" }}>{message}</p>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* One row in the "Actividad reciente" list on Turno activo               */
/* ---------------------------------------------------------------------- */
export function CareEventRecentItem({ event, workerName }: { event: CareEvent; workerName?: string }) {
  const timelineEvent = mapCareEventToTimelineEvent(event, workerName);
  const Icon = iconByType[timelineEvent.type];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "var(--space-3)",
        padding: "var(--space-3) 0",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "var(--color-surface-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={15} color="var(--color-ink)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-ink-soft)" }}>
            {timelineEvent.time}
          </span>
          <span style={{ fontWeight: 600, fontSize: "var(--fs-caption)" }}>{timelineEvent.title}</span>
        </div>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: "var(--fs-caption)",
            color: "var(--color-ink-soft)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {timelineEvent.detail}
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* default / saving / saved flow -- shared by all 8 forms                 */
/* ---------------------------------------------------------------------- */
export type SaveStatus = "idle" | "saving" | "saved";

export function useCareEventSaveFlow(delayMs = 350) {
  const [status, setStatus] = useState<SaveStatus>("idle");

  function save(commit: () => void) {
    if (status !== "idle") return; // guards against double-submit while saving
    setStatus("saving");
    window.setTimeout(() => {
      commit();
      setStatus("saved");
    }, delayMs);
  }

  return { status, save };
}

export function SaveButtonLabel({ status, children }: { status: SaveStatus; children: ReactNode }) {
  if (status === "saving") return <>Guardando…</>;
  return <>{children}</>;
}
