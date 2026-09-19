import type {
  ActionCount,
  ActionType,
  ScoresByType,
} from "@/lib/supabase/types";
import { ACTION_TYPES } from "@/lib/actionType";

export type ScoreByType = Partial<Record<ActionType, number>>;

export type WeekBucket = {
  /** Monday of the week, `YYYY-MM-DD`. */
  weekStart: string;
  byType: ScoreByType;
  total: number;
};

export type WeekdayBucket = {
  /** 0 = Monday … 6 = Sunday. */
  weekday: number;
  label: string;
  byType: ScoreByType;
  total: number;
};

export type Streaks = {
  current: number;
  longest: number;
  activeDays: number;
  windowDays: number;
};

export type RankedAction = {
  id: number;
  name: string;
  /** `null` for the folded "Other" row. */
  type: ActionType | null;
  count: number;
  score: number;
  share: number;
};

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function addDays(date: string, days: number): string {
  const d = new Date(date + "T12:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** 0 = Monday … 6 = Sunday. */
export function isoWeekday(date: string): number {
  return (new Date(date + "T12:00:00").getDay() + 6) % 7;
}

function typesIn(scores: ScoresByType): ActionType[] {
  return ACTION_TYPES.map((t) => t.value).filter((t) => t in scores);
}

/** `date -> type -> score`, dropping zero-score rows. */
function dailyByType(scores: ScoresByType): Map<string, ScoreByType> {
  const map = new Map<string, ScoreByType>();
  for (const type of typesIn(scores)) {
    for (const row of scores[type] ?? []) {
      if (row.total_score <= 0) continue;
      const entry = map.get(row.completed_date) ?? {};
      entry[type] = (entry[type] ?? 0) + row.total_score;
      map.set(row.completed_date, entry);
    }
  }
  return map;
}

function sumByType(byType: ScoreByType): number {
  return Object.values(byType).reduce((sum, v) => sum + (v ?? 0), 0);
}

/**
 * A day counts as active when any given type scored. The current streak
 * survives an empty today so it does not reset before the day is over.
 */
export function computeStreaks(
  scores: ScoresByType,
  today: string,
  windowDays = 30
): Streaks {
  const active = new Set(dailyByType(scores).keys());

  let current = 0;
  let cursor = active.has(today) ? today : addDays(today, -1);
  while (active.has(cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  let longest = 0;
  for (const day of active) {
    if (active.has(addDays(day, -1))) continue;
    let run = 0;
    let d = day;
    while (active.has(d)) {
      run += 1;
      d = addDays(d, 1);
    }
    longest = Math.max(longest, run);
  }

  let activeDays = 0;
  for (let i = 0; i < windowDays; i++) {
    if (active.has(addDays(today, -i))) activeDays += 1;
  }

  return { current, longest, activeDays, windowDays };
}

/** Scores summed per Mon–Sun week for the last `weeks` weeks, oldest first. */
export function weeklyTotals(
  scores: ScoresByType,
  today: string,
  weeks = 12
): WeekBucket[] {
  const daily = dailyByType(scores);
  const thisMonday = addDays(today, -isoWeekday(today));
  const buckets: WeekBucket[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const weekStart = addDays(thisMonday, -7 * w);
    const byType: ScoreByType = {};
    for (let i = 0; i < 7; i++) {
      const entry = daily.get(addDays(weekStart, i));
      if (!entry) continue;
      for (const [type, score] of Object.entries(entry)) {
        const t = Number(type) as ActionType;
        byType[t] = (byType[t] ?? 0) + (score ?? 0);
      }
    }
    buckets.push({ weekStart, byType, total: sumByType(byType) });
  }
  return buckets;
}

/** Average score per weekday over the last `weeks` full weeks ending today. */
export function weekdayAverages(
  scores: ScoresByType,
  today: string,
  weeks = 12
): WeekdayBucket[] {
  const daily = dailyByType(scores);
  const buckets: WeekdayBucket[] = WEEKDAY_LABELS.map((label, weekday) => ({
    weekday,
    label,
    byType: {},
    total: 0,
  }));
  for (let i = 0; i < weeks * 7; i++) {
    const date = addDays(today, -i);
    const entry = daily.get(date);
    if (!entry) continue;
    const bucket = buckets[isoWeekday(date)];
    for (const [type, score] of Object.entries(entry)) {
      const t = Number(type) as ActionType;
      bucket.byType[t] = (bucket.byType[t] ?? 0) + (score ?? 0) / weeks;
    }
  }
  for (const bucket of buckets) bucket.total = sumByType(bucket.byType);
  return buckets;
}

/** Actions ranked by score (count × level); the tail folds into one "Other" row. */
export function rankActions(counts: ActionCount[], limit = 8): RankedAction[] {
  const ranked: RankedAction[] = counts
    .filter((a) => a.habitCount > 0)
    .map((a) => ({
      id: a.id,
      name: a.name ?? `Action ${a.id}`,
      type: a.type,
      count: a.habitCount,
      score: a.habitCount * (a.level ?? 0),
      share: 0,
    }))
    .sort((a, b) => b.score - a.score || b.count - a.count);

  const total = ranked.reduce((sum, a) => sum + a.score, 0);
  if (total === 0) return [];

  const head = ranked.slice(0, limit);
  const tail = ranked.slice(limit);
  if (tail.length > 0) {
    head.push({
      id: -1,
      name: `Other (${tail.length})`,
      type: null,
      count: tail.reduce((sum, a) => sum + a.count, 0),
      score: tail.reduce((sum, a) => sum + a.score, 0),
      share: 0,
    });
  }
  return head.map((a) => ({ ...a, share: a.score / total }));
}
