"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PageTitle } from "@/components/ui/PageTitle";
import { HabitScoreGraph } from "@/components/ui/HabitScoreGraph";
import { useUserRole } from "@/hooks/useUserRole";
import type { ActionType, DailyHabitScore } from "@/lib/supabase/types";
import { getDailyHabitScores } from "./api";
import { HabitTypeSelector } from "./HabitTypeSelector";

import styles from "../shared-page.module.css";

export default function HabitsPage() {
  const { role } = useUserRole("habit");
  const canCreate = role === "admin" || role === "manager";
  const [actionType, setActionType] = useState<ActionType>(1);
  const [scores, setScores] = useState<DailyHabitScore[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handleTypeChange = useCallback((type: ActionType) => {
    setActionType(type);
    setScores([]);
    setError(null);
    setLoading(true);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const today = new Date().toISOString().split("T")[0];

    getDailyHabitScores({ start_date: today, action_type: actionType })
      .then((data) => {
        if (!controller.signal.aborted) setScores(data);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [actionType]);

  return (
    <div className={styles.page}>
      <PageTitle title="Habit Tracker" />
      <h1 className={styles.title}>
        Habit Tracker
        {canCreate && (
          <Link
            href="/habits/create"
            aria-label="Create habit"
            style={{
              marginLeft: 12,
              fontSize: "1.2rem",
              verticalAlign: "middle",
              textDecoration: "none",
            }}
          >
            +
          </Link>
        )}
      </h1>
      <HabitTypeSelector
        value={actionType}
        onChange={handleTypeChange}
        disabled={loading}
      />
      <HabitScoreGraph
        scores={scores}
        loading={loading}
        error={error}
        actionType={actionType}
      />
    </div>
  );
}
