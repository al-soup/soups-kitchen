"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { PageTitle } from "@/components/ui/PageTitle";
import { getHabitById } from "./api";
import type { HabitDetail, ActionType } from "@/lib/supabase/types";

import sharedStyles from "../../../shared-page.module.css";
import styles from "./page.module.css";

const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  1: "Sports",
  2: "Bad Habits",
  3: "Learning",
};

function getBadgeStyle(type: ActionType, level: number) {
  const prefix = type === 2 ? "t2-" : type === 3 ? "t3-" : "";
  return {
    background: `var(--habit-score-${prefix}level-${level})`,
    color: "var(--foreground)",
    borderColor: "transparent",
  };
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HabitDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const id = Number(params.id);

  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole("habit");

  const loading = authLoading || roleLoading;
  const canView = role === "admin" || role === "manager";

  const [habit, setHabit] = useState<HabitDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [dataLoading, setDataLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user)
      router.replace(`/login?redirectTo=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  useEffect(() => {
    if (!canView || loading || !id) return;
    getHabitById(id)
      .then((data) => {
        if (!data) setNotFound(true);
        else setHabit(data);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setDataLoading(false));
  }, [canView, loading, id]);

  if (loading) {
    return (
      <div className={sharedStyles.page}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  if (!canView) {
    return (
      <div className={sharedStyles.page}>
        <PageTitle title="Habit Detail" />
        <h1 className={sharedStyles.title}>Not Authorized</h1>
        <p className={sharedStyles.description}>
          You don&apos;t have permission to view habits.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageTitle title="Habit Detail" />
      <div className={styles.header}>
        <Link
          href="/apps/habits"
          className={styles.backLink}
          aria-label="Back to habits"
        >
          ←
        </Link>
        <h1 className={styles.title}>Habit Detail</h1>
      </div>

      {dataLoading && <p>Loading...</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
      {(notFound || (!id && !dataLoading)) && (
        <div className={styles.notFound}>Habit not found.</div>
      )}

      {habit && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span data-testid="action-name" className={styles.actionName}>
              {habit.action.name ?? `Action ${habit.action.id}`}
            </span>
            {habit.action.level != null && (
              <span
                className={styles.levelBadge}
                style={getBadgeStyle(habit.action.type, habit.action.level)}
              >
                L{habit.action.level}
              </span>
            )}
            <span className={styles.typeBadge}>
              {ACTION_TYPE_LABELS[habit.action.type]}
            </span>
          </div>
          {habit.action.description && (
            <p className={styles.description}>{habit.action.description}</p>
          )}
          <dl className={styles.meta}>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Completed</dt>
              <dd className={styles.metaValue}>
                {formatDateTime(habit.completed_at)}
              </dd>
            </div>
            <div className={styles.metaRow}>
              <dt className={styles.metaLabel}>Recorded</dt>
              <dd className={styles.metaValue}>
                {formatDateTime(habit.created_at)}
              </dd>
            </div>
            {habit.note && (
              <div className={styles.metaRow}>
                <dt className={styles.metaLabel}>Note</dt>
                <dd data-testid="habit-note" className={styles.metaValue}>
                  {habit.note}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
