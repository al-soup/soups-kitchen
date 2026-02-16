"use client";

import { useEffect, useState } from "react";
import { PageTitle } from "@/components/ui/PageTitle";
import { HabitScoreGraph } from "@/components/ui/HabitScoreGraph";
import type { ActionType, DailyHabitScore } from "@/lib/supabase/types";
import { getDailyHabitScores } from "./api";
import { HabitTypeSelector } from "./HabitTypeSelector";

import styles from "../shared-page.module.css";

export default function HabitsPage() {
  const [actionType, setActionType] = useState<ActionType>(1);
  const [scores, setScores] = useState<DailyHabitScore[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setScores([]);
    setError(null);
    setLoading(true);

    const today = new Date().toISOString().split("T")[0];

    getDailyHabitScores({ start_date: today, action_type: actionType })
      .then(setScores)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [actionType]);

  return (
    <div className={styles.page}>
      <PageTitle title="Habit Tracker" />
      <h1 className={styles.title}>Habit Tracker</h1>
      <HabitTypeSelector
        value={actionType}
        onChange={setActionType}
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
