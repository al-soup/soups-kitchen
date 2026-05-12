jest.mock("@/lib/supabase/client", () => ({ getSupabase: jest.fn() }));

import { getSupabase } from "@/lib/supabase/client";
import {
  createKnowledge,
  updateKnowledge,
  setKnowledgeTags,
  getKnowledge,
  deleteKnowledge,
  listKnowledge,
  NotFoundError,
} from "./api";

const entry = {
  id: 1,
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
      { knowledge_id: 1, tag_id: "t1" },
      { knowledge_id: 1, tag_id: "t2" },
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

    expect(knowledgeDeleteEq).toHaveBeenCalledWith("id", 1);
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

    await setKnowledgeTags(1, ["t1", "t2"]);
    expect(eqMock).toHaveBeenCalledWith("knowledge_id", 1);
    expect(insertMock).toHaveBeenCalledWith([
      { knowledge_id: 1, tag_id: "t1" },
      { knowledge_id: 1, tag_id: "t2" },
    ]);
  });

  it("only deletes when tagIds is empty", async () => {
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    const deleteMock = jest.fn().mockReturnValue({ eq: eqMock });
    const insertMock = jest.fn();

    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ delete: deleteMock, insert: insertMock }),
    });

    await setKnowledgeTags(1, []);
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

    await expect(getKnowledge(999)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws NotFoundError when the id is invalid (22P02)", async () => {
    const entrySingle = jest.fn().mockResolvedValue({
      data: null,
      error: {
        code: "22P02",
        message: 'invalid input syntax for type bigint: "abc"',
      },
    });
    const entryEq = jest.fn().mockReturnValue({ single: entrySingle });
    const knowledgeSelect = jest.fn().mockReturnValue({ eq: entryEq });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ select: knowledgeSelect }),
    });

    await expect(getKnowledge(0)).rejects.toBeInstanceOf(NotFoundError);
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

    const result = await getKnowledge(1);
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

    await deleteKnowledge(1);
    expect(eqMock).toHaveBeenCalledWith("id", 1);
  });

  it("throws on DB error", async () => {
    const eqMock = jest
      .fn()
      .mockResolvedValue({ error: { message: "FK constraint" } });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ delete: () => ({ eq: eqMock }) }),
    });
    await expect(deleteKnowledge(1)).rejects.toThrow("FK constraint");
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

    await updateKnowledge(1, {
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
    expect(entryEq).toHaveBeenCalledWith("id", 1);
    expect(tagsDeleteEq).toHaveBeenCalledWith("knowledge_id", 1);
    expect(tagsInsert).toHaveBeenCalledWith([
      { knowledge_id: 1, tag_id: "t1" },
    ]);
  });
});

describe("listKnowledge", () => {
  function setup(rows: unknown[]) {
    const rpc = jest.fn().mockResolvedValue({ data: rows, error: null });
    (getSupabase as jest.Mock).mockReturnValue({ rpc });
    return { rpc };
  }

  it("calls search_knowledge RPC with undefined when no filters provided", async () => {
    const { rpc } = setup([]);
    await listKnowledge({ limit: 20 });
    expect(rpc).toHaveBeenCalledWith("search_knowledge", {
      topic_ids: undefined,
      concept_ids: undefined,
      q: undefined,
      p_offset: 0,
      p_limit: 20,
    });
  });

  it("passes topic_ids when topicIds non-empty", async () => {
    const { rpc } = setup([]);
    await listKnowledge({ topicIds: ["t1", "t2"], limit: 10, offset: 20 });
    expect(rpc).toHaveBeenCalledWith("search_knowledge", {
      topic_ids: ["t1", "t2"],
      concept_ids: undefined,
      q: undefined,
      p_offset: 20,
      p_limit: 10,
    });
  });

  it("passes both topic_ids and concept_ids when set", async () => {
    const { rpc } = setup([]);
    await listKnowledge({ topicIds: ["t1"], conceptIds: ["c1", "c2"] });
    expect(rpc).toHaveBeenCalledWith("search_knowledge", {
      topic_ids: ["t1"],
      concept_ids: ["c1", "c2"],
      q: undefined,
      p_offset: 0,
      p_limit: 20,
    });
  });

  it("treats empty arrays as no filter (undefined param)", async () => {
    const { rpc } = setup([]);
    await listKnowledge({ topicIds: [], conceptIds: [] });
    expect(rpc).toHaveBeenCalledWith(
      "search_knowledge",
      expect.objectContaining({
        topic_ids: undefined,
        concept_ids: undefined,
      })
    );
  });

  it("passes trimmed q when set", async () => {
    const { rpc } = setup([]);
    await listKnowledge({ q: "  indexing  " });
    expect(rpc).toHaveBeenCalledWith(
      "search_knowledge",
      expect.objectContaining({ q: "indexing" })
    );
  });

  it("treats whitespace-only q as undefined", async () => {
    const { rpc } = setup([]);
    await listKnowledge({ q: "   " });
    expect(rpc).toHaveBeenCalledWith(
      "search_knowledge",
      expect.objectContaining({ q: undefined })
    );
  });

  it("passes q together with topic + concept filters", async () => {
    const { rpc } = setup([]);
    await listKnowledge({
      topicIds: ["t1"],
      conceptIds: ["c1"],
      q: "btree",
    });
    expect(rpc).toHaveBeenCalledWith("search_knowledge", {
      topic_ids: ["t1"],
      concept_ids: ["c1"],
      q: "btree",
      p_offset: 0,
      p_limit: 20,
    });
  });

  it("maps tags from JSON and reports hasMore=false at end", async () => {
    const topic = { id: "t1", name: "Databases", type: "topic" };
    const concept = { id: "c1", name: "DB Indexing", type: "concept" };
    setup([
      { ...entry, id: 2, tags: [topic, concept] },
      { ...entry, id: 1, tags: [] },
    ]);

    const page = await listKnowledge({ limit: 20 });

    expect(page.hasMore).toBe(false);
    expect(page.items).toHaveLength(2);
    expect(page.items[0].id).toBe(2);
    expect(page.items[0].tags.map((t) => t.name)).toEqual([
      "Databases",
      "DB Indexing",
    ]);
    expect(page.items[1].tags).toEqual([]);
  });

  it("trims overflow row when limit+1 returned and sets hasMore=true", async () => {
    const rows = Array.from({ length: 3 }, (_, i) => ({
      ...entry,
      id: i + 1,
      tags: [],
    }));
    setup(rows);

    const page = await listKnowledge({ limit: 2 });

    expect(page.hasMore).toBe(true);
    expect(page.items).toHaveLength(2);
  });

  it("throws on RPC error", async () => {
    const rpc = jest
      .fn()
      .mockResolvedValue({ data: null, error: { message: "boom" } });
    (getSupabase as jest.Mock).mockReturnValue({ rpc });
    await expect(listKnowledge()).rejects.toThrow("boom");
  });
});
