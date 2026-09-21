import { ACTION_TYPES, type ActionTypeFilter } from "@/lib/actionType";
import styles from "./HabitTypeSelector.module.css";

export type HabitTypeOption<T extends ActionTypeFilter> = {
  value: T;
  label: string;
};

interface HabitTypeSelectorProps<T extends ActionTypeFilter> {
  value: T;
  onChange: (type: T) => void;
  disabled: boolean;
  types?: HabitTypeOption<T>[];
}

export function HabitTypeSelector<T extends ActionTypeFilter>({
  value,
  onChange,
  disabled,
  types,
}: HabitTypeSelectorProps<T>) {
  const options = types ?? (ACTION_TYPES as HabitTypeOption<T>[]);
  return (
    <div className={styles.group} role="radiogroup" aria-label="Habit type">
      {options.map((t) => (
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
