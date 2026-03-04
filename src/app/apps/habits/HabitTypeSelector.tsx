import type { ActionType } from "@/lib/supabase/types";
import styles from "./HabitTypeSelector.module.css";

const TYPES: { value: ActionType; label: string }[] = [
  { value: 1, label: "Sports" },
  { value: 2, label: "Bad Habits" },
  { value: 3, label: "Learning" },
];

interface HabitTypeSelectorProps {
  value: ActionType;
  onChange: (type: ActionType) => void;
  disabled: boolean;
  types?: { value: ActionType; label: string }[];
}

export function HabitTypeSelector({
  value,
  onChange,
  disabled,
  types,
}: HabitTypeSelectorProps) {
  return (
    <div className={styles.group} role="radiogroup" aria-label="Habit type">
      {(types ?? TYPES).map((t) => (
        <button
          key={t.value}
          className={styles.option}
          role="radio"
          aria-checked={value === t.value}
          data-active={value === t.value}
          data-testid={`type-${t.value}`}
          disabled={disabled}
          onClick={() => onChange(t.value)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
