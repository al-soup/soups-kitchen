"use client";

import { useState } from "react";
import type { Action, ActionType } from "@/lib/supabase/types";
import styles from "./ActionRow.module.css";

export type SelectionEntry = {
  note: string;
  completedAt: string;
};

interface ActionRowProps {
  action: Action;
  selected: boolean;
  selectionEntry: SelectionEntry | undefined;
  onChange: (
    actionId: number,
    checked: boolean,
    field?: "note" | "completedAt",
    value?: string
  ) => void;
  disabled: boolean;
}

function getLocalToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getCurrentTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function getBadgeStyle(type: ActionType, level: number) {
  const prefix = type === 2 ? "t2-" : type === 3 ? "t3-" : "";
  const bgVar = `var(--habit-score-${prefix}level-${level})`;
  return {
    background: bgVar,
    color: "var(--foreground)",
    borderColor: "transparent",
  };
}

export function ActionRow({
  action,
  selected,
  selectionEntry,
  onChange,
  disabled,
}: ActionRowProps) {
  const [expanded, setExpanded] = useState(false);

  const handleRowClick = () => {
    if (disabled) return;
    if (!selected) {
      onChange(action.id, true);
      setExpanded(true);
    } else {
      setExpanded((v) => !v);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!e.target.checked) setExpanded(false);
    onChange(action.id, e.target.checked);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    const time = newDate === getLocalToday() ? getCurrentTime() : "10:10";
    onChange(action.id, true, "completedAt", `${newDate}T${time}`);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [date] = (selectionEntry?.completedAt ?? "").split("T");
    onChange(action.id, true, "completedAt", `${date}T${e.target.value}`);
  };

  const [dateVal, timeVal] = (selectionEntry?.completedAt ?? "T").split("T");

  const badgeStyle =
    action.level != null ? getBadgeStyle(action.type, action.level) : undefined;

  const rowClasses = [
    styles.row,
    selected ? styles.rowSelected : "",
    disabled ? styles.rowDisabled : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      data-testid={`action-row-${action.id}`}
      className={rowClasses}
      onClick={handleRowClick}
    >
      <div className={styles.checkbox} onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          disabled={disabled}
          aria-label={action.name ?? `Action ${action.id}`}
          onChange={handleCheckboxChange}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className={styles.meta}>
          <span className={styles.name}>
            {action.name ?? `Action ${action.id}`}
          </span>
          {action.level != null && (
            <span className={styles.levelBadge} style={badgeStyle}>
              L{action.level}
            </span>
          )}
        </div>
        {selected && expanded && selectionEntry && (
          <div
            className={styles.expansion}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Note</label>
              <textarea
                className={styles.noteField}
                value={selectionEntry.note}
                disabled={disabled}
                placeholder="Add a note..."
                onChange={(e) =>
                  onChange(action.id, true, "note", e.target.value)
                }
              />
            </div>
            <div className={styles.dateTimeRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Date</label>
                <input
                  type="date"
                  lang="en-GB"
                  className={styles.dateField}
                  value={dateVal}
                  disabled={disabled}
                  onChange={handleDateChange}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Time</label>
                <input
                  type="time"
                  lang="en-GB"
                  className={styles.dateField}
                  value={timeVal}
                  disabled={disabled}
                  onChange={handleTimeChange}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
