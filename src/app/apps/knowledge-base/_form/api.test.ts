jest.mock("@/lib/supabase/client", () => ({ getSupabase: jest.fn() }));

import { getSupabase } from "@/lib/supabase/client";
import {
  createKnowledge,
  updateKnowledge,
  setKnowledgeTags,
  getKnowledge,
  deleteKnowledge,
  NotFoundError,
} from "./api";

const entry = {
  id: "k1",
  question: "What is X?",
  summary: "X is a thing.",
  detail: null,
  search_vector: null,
  created_at: "2026-05-11T12:00:00Z",
  updated_at: "2026-05-11T12:00:00Z",
};

beforeEach(() => jest.clearAllMocks());

function chainSingle(result: { data: unknown; error: unknown }) {
  const single = jest.fn().mockResolvedValue(result);
  return { single };
}

describe("createKnowledge", () => {
  it("inserts the entry then bulk-inserts tags", async () => {
    const knowledgeSelect = jest
      .fn()
      .mockReturnValue(chainSingle({ data: entry, error: null }));
    const knowledgeInsert = jest
      .fn()
      .mockReturnValue({ select: knowledgeSelect });
    const tagsInsert = jest.fn().mockResolvedValue({ error: null });

    (getSupabase as jest.Mock).mockReturnValue({
      from: (table: string) => {
        if (table === "knowledge") return { insert: knowledgeInsert };
        if (table === "knowledge_tags") return { insert: tagsInsert };
        throw new Error(`unexpected table ${table}`);
      },
    });

    const result = await createKnowledge({
      question: "  What is X?  ",
      summary: "  X is a thing.  ",
      detail: "  ",
      tagIds: ["t1", "t2"],
    });

    expect(knowledgeInsert).toHaveBeenCalledWith({
      question: "What is X?",
      summary: "X is a thing.",
      detail: null,
    });
    expect(tagsInsert).toHaveBeenCalledWith([
      { knowledge_id: "k1", tag_id: "t1" },
      { knowledge_id: "k1", tag_id: "t2" },
    ]);
    expect(result).toEqual(entry);
  });

  it("rolls back the entry if tag insert fails", async () => {
    const knowledgeSelect = jest
      .fn()
      .mockReturnValue(chainSingle({ data: entry, error: null }));
    const knowledgeInsert = jest
      .fn()
      .mockReturnValue({ select: knowledgeSelect });
    const knowledgeDeleteEq = jest.fn().mockResolvedValue({ error: null });
    const knowledgeDelete = jest
      .fn()
      .mockReturnValue({ eq: knowledgeDeleteEq });
    const tagsInsert = jest
      .fn()
      .mockResolvedValue({ error: { message: "FK violation" } });

    (getSupabase as jest.Mock).mockReturnValue({
      from: (table: string) => {
        if (table === "knowledge")
          return { insert: knowledgeInsert, delete: knowledgeDelete };
        if (table === "knowledge_tags") return { insert: tagsInsert };
        throw new Error(`unexpected table ${table}`);
      },
    });

    await expect(
      createKnowledge({
        question: "What",
        summary: "Sum",
        detail: null,
        tagIds: ["bad"],
      })
    ).rejects.toThrow("FK violation");

    expect(knowledgeDeleteEq).toHaveBeenCalledWith("id", "k1");
  });

  it("throws if question is blank after trim", async () => {
    await expect(
      createKnowledge({
        question: "   ",
        summary: "OK",
        detail: null,
        tagIds: [],
      })
    ).rejects.toThrow("Question is required");
    expect(getSupabase).not.toHaveBeenCalled();
  });

  it("throws if summary is blank after trim", async () => {
    await expect(
      createKnowledge({
        question: "OK",
        summary: "   ",
        detail: null,
        tagIds: [],
      })
    ).rejects.toThrow("Summary is required");
  });
});

describe("setKnowledgeTags", () => {
  it("deletes existing tags then inserts new ones", async () => {
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    const deleteMock = jest.fn().mockReturnValue({ eq: eqMock });
    const insertMock = jest.fn().mockResolvedValue({ error: null });

    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ delete: deleteMock, insert: insertMock }),
    });

    await setKnowledgeTags("k1", ["t1", "t2"]);
    expect(eqMock).toHaveBeenCalledWith("knowledge_id", "k1");
    expect(insertMock).toHaveBeenCalledWith([
      { knowledge_id: "k1", tag_id: "t1" },
      { knowledge_id: "k1", tag_id: "t2" },
    ]);
  });

  it("only deletes when tagIds is empty", async () => {
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    const deleteMock = jest.fn().mockReturnValue({ eq: eqMock });
    const insertMock = jest.fn();

    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ delete: deleteMock, insert: insertMock }),
    });

    await setKnowledgeTags("k1", []);
    expect(deleteMock).toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });
});

describe("getKnowledge", () => {
  it("throws NotFoundError when the row is missing (PGRST116)", async () => {
    const entrySingle = jest.fn().mockResolvedValue({
      data: null,
      error: { code: "PGRST116", message: "Cannot coerce the result..." },
    });
    const entryEq = jest.fn().mockReturnValue({ single: entrySingle });
    const knowledgeSelect = jest.fn().mockReturnValue({ eq: entryEq });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ select: knowledgeSelect }),
    });

    await expect(getKnowledge("does-not-exist")).rejects.toBeInstanceOf(
      NotFoundError
    );
  });

  it("throws NotFoundError when the id is not a valid UUID (22P02)", async () => {
    const entrySingle = jest.fn().mockResolvedValue({
      data: null,
      error: {
        code: "22P02",
        message: 'invalid input syntax for type uuid: "abc"',
      },
    });
    const entryEq = jest.fn().mockReturnValue({ single: entrySingle });
    const knowledgeSelect = jest.fn().mockReturnValue({ eq: entryEq });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ select: knowledgeSelect }),
    });

    await expect(getKnowledge("abc")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("returns the entry plus tag ids", async () => {
    const entrySingle = jest
      .fn()
      .mockResolvedValue({ data: entry, error: null });
    const entryEq = jest.fn().mockReturnValue({ single: entrySingle });
    const knowledgeSelect = jest.fn().mockReturnValue({ eq: entryEq });

    const tagsEq = jest.fn().mockResolvedValue({
      data: [{ tag_id: "t1" }, { tag_id: "t2" }],
      error: null,
    });
    const tagsSelect = jest.fn().mockReturnValue({ eq: tagsEq });

    (getSupabase as jest.Mock).mockReturnValue({
      from: (table: string) => {
        if (table === "knowledge") return { select: knowledgeSelect };
        if (table === "knowledge_tags") return { select: tagsSelect };
        throw new Error(`unexpected table ${table}`);
      },
    });

    const result = await getKnowledge("k1");
    expect(result.entry).toEqual(entry);
    expect(result.tagIds).toEqual(["t1", "t2"]);
  });
});

describe("deleteKnowledge", () => {
  it("deletes by id", async () => {
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    const deleteMock = jest.fn().mockReturnValue({ eq: eqMock });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ delete: deleteMock }),
    });

    await deleteKnowledge("k1");
    expect(eqMock).toHaveBeenCalledWith("id", "k1");
  });

  it("throws on DB error", async () => {
    const eqMock = jest
      .fn()
      .mockResolvedValue({ error: { message: "FK constraint" } });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ delete: () => ({ eq: eqMock }) }),
    });
    await expect(deleteKnowledge("k1")).rejects.toThrow("FK constraint");
  });
});

describe("updateKnowledge", () => {
  it("updates the entry then replaces tags", async () => {
    const entrySingle = jest
      .fn()
      .mockResolvedValue({ data: entry, error: null });
    const entrySelect = jest.fn().mockReturnValue({ single: entrySingle });
    const entryEq = jest.fn().mockReturnValue({ select: entrySelect });
    const updateMock = jest.fn().mockReturnValue({ eq: entryEq });

    const tagsDeleteEq = jest.fn().mockResolvedValue({ error: null });
    const tagsDelete = jest.fn().mockReturnValue({ eq: tagsDeleteEq });
    const tagsInsert = jest.fn().mockResolvedValue({ error: null });

    (getSupabase as jest.Mock).mockReturnValue({
      from: (table: string) => {
        if (table === "knowledge") return { update: updateMock };
        if (table === "knowledge_tags")
          return { delete: tagsDelete, insert: tagsInsert };
        throw new Error(`unexpected table ${table}`);
      },
    });

    await updateKnowledge("k1", {
      question: "Q",
      summary: "S",
      detail: "D",
      tagIds: ["t1"],
    });

    expect(updateMock).toHaveBeenCalledWith({
      question: "Q",
      summary: "S",
      detail: "D",
    });
    expect(entryEq).toHaveBeenCalledWith("id", "k1");
    expect(tagsDeleteEq).toHaveBeenCalledWith("knowledge_id", "k1");
    expect(tagsInsert).toHaveBeenCalledWith([
      { knowledge_id: "k1", tag_id: "t1" },
    ]);
  });
});
