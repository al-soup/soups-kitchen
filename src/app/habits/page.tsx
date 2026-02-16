"use client";

import { useEffect, useState } from "react";
import { PageTitle } from "@/components/ui/PageTitle";
import { HabitScoreGraph } from "@/components/ui/HabitScoreGraph";
import type { DailyHabitScore } from "@/lib/supabase/types";
import { getDailyHabitScores } from "./api";

import styles from "../shared-page.module.css";

export default function HabitsPage() {
  const [scores, setScores] = useState<DailyHabitScore[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    getDailyHabitScores({ start_date: today, action_type: 1 })
      .then(setScores)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <PageTitle title="Habit Tracker" />
      <h1 className={styles.title}>Habit Tracker</h1>
      <HabitScoreGraph scores={scores} loading={loading} error={error} />
    </div>
  );
}
