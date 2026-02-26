jest.mock("@/lib/supabase/client", () => ({ getSupabase: jest.fn() }));
jest.mock("@/lib/actionsCache", () => ({
  getCachedActions: jest.fn(),
  setCachedActions: jest.fn(),
}));

import { getActions, createHabits } from "./api";
import { getSupabase } from "@/lib/supabase/client";
import { getCachedActions, setCachedActions } from "@/lib/actionsCache";

const mockActions = [
  { id: 1, name: "Run", description: null, type: 1, level: 1 },
];

beforeEach(() => jest.clearAllMocks());

describe("getActions", () => {
  it("returns cached data without hitting Supabase", async () => {
    (getCachedActions as jest.Mock).mockReturnValue(mockActions);
    const result = await getActions();
    expect(result).toEqual(mockActions);
    expect(getSupabase).not.toHaveBeenCalled();
  });

  it("fetches from Supabase and writes cache on miss", async () => {
    (getCachedActions as jest.Mock).mockReturnValue(null);
    const orderMock = jest
      .fn()
      .mockResolvedValue({ data: mockActions, error: null });
    const selectMock = jest.fn().mockReturnValue({ order: orderMock });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ select: selectMock }),
    });

    const result = await getActions();
    expect(result).toEqual(mockActions);
    expect(setCachedActions).toHaveBeenCalledWith(mockActions);
  });

  it("throws when Supabase returns an error", async () => {
    (getCachedActions as jest.Mock).mockReturnValue(null);
    const orderMock = jest
      .fn()
      .mockResolvedValue({ data: null, error: { message: "DB error" } });
    const selectMock = jest.fn().mockReturnValue({ order: orderMock });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ select: selectMock }),
    });

    await expect(getActions()).rejects.toThrow("DB error");
  });
});

describe("createHabits", () => {
  const rows = [
    { action_id: 1, note: "test", completed_at: "2026-02-26T10:10:00" },
  ];

  it("calls insert with the provided rows", async () => {
    const insertMock = jest.fn().mockResolvedValue({ error: null });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ insert: insertMock }),
    });

    await createHabits(rows);
    expect(insertMock).toHaveBeenCalledWith(rows);
  });

  it("throws when insert returns an error", async () => {
    const insertMock = jest
      .fn()
      .mockResolvedValue({ error: { message: "Insert failed" } });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ insert: insertMock }),
    });

    await expect(createHabits(rows)).rejects.toThrow("Insert failed");
  });
});
