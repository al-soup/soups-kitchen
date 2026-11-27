jest.mock("@/lib/supabase/client", () => ({ getSupabase: jest.fn() }));

import { withLabVisitNotes } from "./labVisit";
import { getSupabase } from "@/lib/supabase/client";
import type { Action } from "@/lib/supabase/types";

const lab: Action = {
  id: 7,
  name: "Laboratorium Workout",
  description: null,
  type: 1,
  level: 4,
};
const run: Action = {
  id: 1,
  name: "Run",
  description: null,
  type: 1,
  level: 1,
};

function mockCount(count: number) {
  const lte = jest.fn().mockResolvedValue({ count, error: null });
  const gte = jest.fn().mockReturnValue({ lte });
  const eq = jest.fn().mockReturnValue({ gte });
  const select = jest.fn().mockReturnValue({ eq });
  (getSupabase as jest.Mock).mockReturnValue({ from: () => ({ select }) });
  return { eq, gte, lte };
}

const row = (completed_at: string, note: string | null = null) => ({
  action_id: lab.id,
  note,
  completed_at,
});

beforeEach(() => jest.clearAllMocks());

describe("withLabVisitNotes", () => {
  it("counts prior visits in the year and divides the yearly price", async () => {
    const q = mockCount(2);
    const [out] = await withLabVisitNotes([row("2026-05-01T10:00:00")], [lab]);
    expect(out.note).toBe("Besuch 3: 56.67 CHF");
    expect(q.eq).toHaveBeenCalledWith("action_id", 7);
    expect(q.gte).toHaveBeenCalledWith("completed_at", "2026-01-01T00:00:00");
    expect(q.lte).toHaveBeenCalledWith("completed_at", "2026-05-01T10:00:00");
  });

  it("appends to an existing note on a new line", async () => {
    mockCount(0);
    const [out] = await withLabVisitNotes(
      [row("2027-02-01T10:00:00", "legs")],
      [lab]
    );
    expect(out.note).toBe("legs\nBesuch 1: 1000.00 CHF");
  });

  it("falls back to the most recent known year", async () => {
    mockCount(3);
    const [out] = await withLabVisitNotes([row("2030-02-01T10:00:00")], [lab]);
    expect(out.note).toBe("Besuch 4: 250.00 CHF");
  });

  it("leaves other actions untouched", async () => {
    const other = { action_id: run.id, note: "x", completed_at: "2026-01-01" };
    const out = await withLabVisitNotes([other], [lab, run]);
    expect(out).toEqual([other]);
    expect(getSupabase).not.toHaveBeenCalled();
  });
});
