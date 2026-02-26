"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { PageTitle } from "@/components/ui/PageTitle";
import { HabitTypeSelector } from "../HabitTypeSelector";
import { ActionList, type SelectionMap } from "./ActionList";
import { getActions, createHabits } from "./api";
import type { Action, ActionType } from "@/lib/supabase/types";

import sharedStyles from "../../../shared-page.module.css";
import styles from "./page.module.css";

export default function CreateHabitPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole("habit");

  const loading = authLoading || roleLoading;
  const canCreate = role === "admin" || role === "manager";

  const [actionType, setActionType] = useState<ActionType>(1);
  const [actions, setActions] = useState<Action[]>([]);
  const [actionsLoading, setActionsLoading] = useState(true);
  const [actionsError, setActionsError] = useState<string | null>(null);
  const [selection, setSelection] = useState<SelectionMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user)
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  useEffect(() => {
    if (!canCreate || loading) return;
    setActionsLoading(true);
    getActions()
      .then((data) => setActions(data))
      .catch((err: Error) => setActionsError(err.message))
      .finally(() => setActionsLoading(false));
  }, [canCreate, loading]);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const filteredActions = useMemo(
    () => actions.filter((a) => a.type === actionType),
    [actions, actionType]
  );

  const handleTypeChange = useCallback((type: ActionType) => {
    setActionType(type);
    setSelection({});
  }, []);

  const handleSelectionChange = useCallback(
    (
      actionId: number,
      checked: boolean,
      field?: "note" | "completedAt",
      value?: string
    ) => {
      setSelection((prev) => {
        if (!checked) {
          const next = { ...prev };
          delete next[actionId];
          return next;
        }
        if (field && prev[actionId]) {
          return {
            ...prev,
            [actionId]: { ...prev[actionId], [field]: value ?? "" },
          };
        }
        if (!prev[actionId]) {
          const d = new Date();
          const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
          return {
            ...prev,
            [actionId]: { note: "", completedAt: `${date}T${time}` },
          };
        }
        return prev;
      });
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    const rows = Object.entries(selection).map(([id, entry]) => ({
      action_id: Number(id),
      note: entry.note || null,
      completed_at: entry.completedAt
        ? `${entry.completedAt}:00`
        : new Date().toISOString(),
    }));

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await createHabits(rows);
      setSelection({});
      setSubmitSuccess(true);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSubmitSuccess(false), 2500);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }, [selection]);

  if (loading) {
    return (
      <div className={sharedStyles.page}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  if (!canCreate) {
    return (
      <div className={sharedStyles.page}>
        <PageTitle title="Create Habit" />
        <h1 className={sharedStyles.title}>Not Authorized</h1>
        <p className={sharedStyles.description}>
          You don&apos;t have permission to create habits.
        </p>
      </div>
    );
  }

  const selectedCount = Object.keys(selection).length;

  return (
    <div className={styles.page}>
      <PageTitle title="Create Habit" />
      <div className={styles.header}>
        <Link
          href="/apps/habits"
          className={styles.backLink}
          aria-label="Back to habits"
        >
          ←
        </Link>
        <h1 className={styles.title}>Create Habit</h1>
      </div>

      <HabitTypeSelector
        value={actionType}
        onChange={handleTypeChange}
        disabled={submitting}
      />

      {actionsLoading && (
        <p className={sharedStyles.description}>Loading actions...</p>
      )}
      {actionsError && <p className={styles.actionsError}>{actionsError}</p>}

      {!actionsLoading && !actionsError && filteredActions.length === 0 && (
        <p className={styles.emptyState}>No actions for this type.</p>
      )}

      {!actionsLoading && !actionsError && filteredActions.length > 0 && (
        <ActionList
          actions={filteredActions}
          selection={selection}
          onChange={handleSelectionChange}
          disabled={submitting}
        />
      )}

      <div className={styles.submitBar}>
        <button
          className={styles.submitBtn}
          disabled={selectedCount === 0 || submitting}
          onClick={handleSubmit}
        >
          {submitting
            ? "Saving..."
            : `Save ${selectedCount > 0 ? `${selectedCount} ` : ""}habit${selectedCount !== 1 ? "s" : ""}`}
        </button>
        {submitSuccess && (
          <span className={styles.successMessage}>Saved successfully!</span>
        )}
        {submitError && (
          <span className={styles.errorMessage}>{submitError}</span>
        )}
      </div>
    </div>
  );
}
