jest.mock("@/lib/supabase/client", () => ({ getSupabase: jest.fn() }));

import { getSupabase } from "@/lib/supabase/client";
import {
  listTags,
  createTag,
  renameTag,
  deleteTag,
  DuplicateTagError,
} from "./api";

const tag = { id: "t1", name: "DB Indexing", type: "concept" as const };

beforeEach(() => jest.clearAllMocks());

describe("listTags", () => {
  it("returns data ordered by name", async () => {
    const orderMock = jest.fn().mockResolvedValue({ data: [tag], error: null });
    const selectMock = jest.fn().mockReturnValue({ order: orderMock });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ select: selectMock }),
    });

    const result = await listTags();
    expect(selectMock).toHaveBeenCalledWith("*");
    expect(orderMock).toHaveBeenCalledWith("name");
    expect(result).toEqual([tag]);
  });

  it("throws when Supabase returns an error", async () => {
    const orderMock = jest
      .fn()
      .mockResolvedValue({ data: null, error: { message: "DB error" } });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ select: () => ({ order: orderMock }) }),
    });

    await expect(listTags()).rejects.toThrow("DB error");
  });
});

function mockInsert(result: { data: unknown; error: unknown }) {
  const singleMock = jest.fn().mockResolvedValue(result);
  const selectMock = jest.fn().mockReturnValue({ single: singleMock });
  const insertMock = jest.fn().mockReturnValue({ select: selectMock });
  (getSupabase as jest.Mock).mockReturnValue({
    from: () => ({ insert: insertMock }),
  });
  return { insertMock, selectMock, singleMock };
}

describe("createTag", () => {
  it("trims name and inserts with type", async () => {
    const { insertMock } = mockInsert({ data: tag, error: null });
    const result = await createTag("  DB Indexing  ", "concept");
    expect(insertMock).toHaveBeenCalledWith({
      name: "DB Indexing",
      type: "concept",
    });
    expect(result).toEqual(tag);
  });

  it("throws DuplicateTagError on 23505", async () => {
    mockInsert({
      data: null,
      error: { code: "23505", message: "duplicate key" },
    });
    await expect(createTag("Existing", "topic")).rejects.toBeInstanceOf(
      DuplicateTagError
    );
  });

  it("throws generic Error on other DB errors", async () => {
    mockInsert({
      data: null,
      error: { code: "42501", message: "RLS violation" },
    });
    await expect(createTag("X", "topic")).rejects.toThrow("RLS violation");
  });

  it("throws when name is empty after trim", async () => {
    await expect(createTag("   ", "topic")).rejects.toThrow(
      "Tag name is required"
    );
    expect(getSupabase).not.toHaveBeenCalled();
  });
});

function mockUpdate(result: { data: unknown; error: unknown }) {
  const singleMock = jest.fn().mockResolvedValue(result);
  const selectMock = jest.fn().mockReturnValue({ single: singleMock });
  const eqMock = jest.fn().mockReturnValue({ select: selectMock });
  const updateMock = jest.fn().mockReturnValue({ eq: eqMock });
  (getSupabase as jest.Mock).mockReturnValue({
    from: () => ({ update: updateMock }),
  });
  return { updateMock, eqMock };
}

describe("renameTag", () => {
  it("trims name and updates by id", async () => {
    const { updateMock, eqMock } = mockUpdate({
      data: { ...tag, name: "Indexing" },
      error: null,
    });
    const result = await renameTag("t1", "  Indexing  ");
    expect(updateMock).toHaveBeenCalledWith({ name: "Indexing" });
    expect(eqMock).toHaveBeenCalledWith("id", "t1");
    expect(result.name).toBe("Indexing");
  });

  it("throws DuplicateTagError on 23505", async () => {
    mockUpdate({
      data: null,
      error: { code: "23505", message: "duplicate" },
    });
    await expect(renameTag("t1", "Existing")).rejects.toBeInstanceOf(
      DuplicateTagError
    );
  });

  it("throws when name is empty after trim", async () => {
    await expect(renameTag("t1", "   ")).rejects.toThrow(
      "Tag name is required"
    );
    expect(getSupabase).not.toHaveBeenCalled();
  });
});

describe("deleteTag", () => {
  it("deletes by id", async () => {
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    const deleteMock = jest.fn().mockReturnValue({ eq: eqMock });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ delete: deleteMock }),
    });

    await deleteTag("t1");
    expect(deleteMock).toHaveBeenCalled();
    expect(eqMock).toHaveBeenCalledWith("id", "t1");
  });

  it("throws when delete returns an error", async () => {
    const eqMock = jest
      .fn()
      .mockResolvedValue({ error: { message: "Delete failed" } });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ delete: () => ({ eq: eqMock }) }),
    });

    await expect(deleteTag("t1")).rejects.toThrow("Delete failed");
  });
});
