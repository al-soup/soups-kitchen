"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { PageTitle } from "@/components/ui/PageTitle";
import { getHabitById, updateHabit, deleteHabit } from "./api";
import type { HabitDetail, ActionType } from "@/lib/supabase/types";
import { getBadgeStyle } from "@/lib/badgeStyles";

import sharedStyles from "../../../shared-page.module.css";
import styles from "./page.module.css";

const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  1: "Sports",
  2: "Bad Habits",
  3: "Learning",
};

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

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
        <HabitCard
          habit={habit}
          editing={editing}
          saving={saving}
          saveError={saveError}
          editNote={editNote}
          editDate={editDate}
          editTime={editTime}
          confirmingDelete={confirmingDelete}
          deleting={deleting}
          deleteError={deleteError}
          onEditNote={setEditNote}
          onEditDate={setEditDate}
          onEditTime={setEditTime}
          onStartEdit={() => {
            const dt = habit.completed_at
              ? new Date(habit.completed_at)
              : null;
            setEditDate(dt ? dt.toISOString().slice(0, 10) : "");
            setEditTime(
              dt
                ? dt.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""
            );
            setEditNote(habit.note ?? "");
            setSaveError(null);
            setEditing(true);
          }}
          onCancelEdit={() => {
            setEditing(false);
            setSaveError(null);
          }}
          onSave={async () => {
            setSaving(true);
            setSaveError(null);
            try {
              const completed_at = `${editDate}T${editTime}:00`;
              await updateHabit(id, { note: editNote, completed_at });
              setHabit({
                ...habit,
                note: editNote,
                completed_at,
              });
              setEditing(false);
            } catch (err: unknown) {
              setSaveError(
                err instanceof Error ? err.message : "Save failed"
              );
            } finally {
              setSaving(false);
            }
          }}
          onStartDelete={() => {
            setDeleteError(null);
            setConfirmingDelete(true);
          }}
          onCancelDelete={() => setConfirmingDelete(false)}
          onConfirmDelete={async () => {
            setDeleting(true);
            setDeleteError(null);
            try {
              await deleteHabit(id);
              router.push("/apps/habits");
            } catch (err: unknown) {
              setDeleteError(
                err instanceof Error ? err.message : "Delete failed"
              );
              setDeleting(false);
            }
          }}
        />
      )}
    </div>
  );
}

function HabitCard({
  habit,
  editing,
  saving,
  saveError,
  editNote,
  editDate,
  editTime,
  confirmingDelete,
  deleting,
  deleteError,
  onEditNote,
  onEditDate,
  onEditTime,
  onStartEdit,
  onCancelEdit,
  onSave,
  onStartDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  habit: HabitDetail;
  editing: boolean;
  saving: boolean;
  saveError: string | null;
  editNote: string;
  editDate: string;
  editTime: string;
  confirmingDelete: boolean;
  deleting: boolean;
  deleteError: string | null;
  onEditNote: (v: string) => void;
  onEditDate: (v: string) => void;
  onEditTime: (v: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onStartDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  return (
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
            {editing ? (
              <div className={styles.dateTimeRow}>
                <input
                  type="date"
                  className={styles.editInput}
                  value={editDate}
                  onChange={(e) => onEditDate(e.target.value)}
                />
                <input
                  type="time"
                  className={styles.editInput}
                  value={editTime}
                  onChange={(e) => onEditTime(e.target.value)}
                />
              </div>
            ) : (
              formatDateTime(habit.completed_at)
            )}
          </dd>
        </div>
        <div className={styles.metaRow}>
          <dt className={styles.metaLabel}>Recorded</dt>
          <dd className={styles.metaValue}>
            {formatDateTime(habit.created_at)}
          </dd>
        </div>
        <div className={styles.metaRow}>
          <dt className={styles.metaLabel}>Note</dt>
          <dd data-testid="habit-note" className={styles.metaValueNote}>
            {editing ? (
              <textarea
                className={styles.editTextarea}
                value={editNote}
                onChange={(e) => onEditNote(e.target.value)}
                rows={3}
              />
            ) : (
              habit.note || "—"
            )}
          </dd>
        </div>
      </dl>

      {saveError && <p className={styles.errorMessage}>{saveError}</p>}
      {deleteError && <p className={styles.errorMessage}>{deleteError}</p>}

      <div className={styles.actions}>
        {editing ? (
          <>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={onSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              className={styles.btn}
              onClick={onCancelEdit}
              disabled={saving}
            >
              Cancel
            </button>
          </>
        ) : confirmingDelete ? (
          <div className={styles.deleteConfirm}>
            <span>Delete this habit?</span>
            <button
              className={`${styles.btn} ${styles.btnDangerFill}`}
              onClick={onConfirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Confirm"}
            </button>
            <button
              className={styles.btn}
              onClick={onCancelDelete}
              disabled={deleting}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={onStartEdit}
            >
              Edit
            </button>
            <button
              className={`${styles.btn} ${styles.btnDanger}`}
              onClick={onStartDelete}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
