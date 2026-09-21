import type { Action } from "@/lib/supabase/types";
import { ActionRow, type SelectionEntry } from "./ActionRow";
import styles from "./ActionList.module.css";

export type SelectionMap = Record<number, SelectionEntry>;

interface ActionListProps {
  actions: Action[];
  selection: SelectionMap;
  onChange: (
    actionId: number,
    checked: boolean,
    field?: "note" | "completedAt",
    value?: string
  ) => void;
  disabled: boolean;
}

export function ActionList({
  actions,
  selection,
  onChange,
  disabled,
}: ActionListProps) {
  return (
    <div className={styles.list}>
      {actions.map((action) => (
        <ActionRow
          key={action.id}
          action={action}
          selected={action.id in selection}
          selectionEntry={selection[action.id]}
          onChange={onChange}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
