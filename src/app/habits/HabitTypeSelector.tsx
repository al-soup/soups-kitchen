import type { ActionType } from "@/lib/supabase/types";
import styles from "./HabitTypeSelector.module.css";

const TYPES: { value: ActionType; label: string }[] = [
  { value: 1, label: "Type 1" },
  { value: 2, label: "Type 2" },
  { value: 3, label: "Type 3" },
];

interface HabitTypeSelectorProps {
  value: ActionType;
  onChange: (type: ActionType) => void;
  disabled: boolean;
}

export function HabitTypeSelector({
  value,
  onChange,
  disabled,
}: HabitTypeSelectorProps) {
  return (
    <div className={styles.group} role="radiogroup" aria-label="Habit type">
      {TYPES.map((t) => (
        <button
          key={t.value}
          className={styles.option}
          role="radio"
          aria-checked={value === t.value}
          data-active={value === t.value}
          disabled={disabled}
          onClick={() => onChange(t.value)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
