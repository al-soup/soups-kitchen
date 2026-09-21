jest.mock("@/lib/supabase/client", () => ({ getSupabase: jest.fn() }));

import { getSupabase } from "@/lib/supabase/client";
import {
  listResources,
  uploadResource,
  renameResource,
  deleteResource,
  getSignedUrl,
  sanitizeFilename,
  placeholderToken,
  listResourcesByIds,
  getSignedUrlsByIds,
  UploadError,
} from "./api";
import type { Resource } from "@/lib/supabase/types";

const baseResource: Resource = {
  id: "r1",
  bucket: "resources",
  storage_path: "r1/diagram.png",
  filename: "Diagram.png",
  label: "Diagram",
  mime_type: "image/png",
  size_bytes: 1024,
  created_at: "2026-05-11T12:00:00Z",
};

beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(global, "crypto", {
    value: { randomUUID: () => "00000000-0000-0000-0000-000000000abc" },
    configurable: true,
  });
});

describe("sanitizeFilename", () => {
  it("preserves alphanumerics and replaces spaces", () => {
    expect(sanitizeFilename("My Diagram.png")).toBe("My-Diagram.png");
  });

  it("strips unsafe punctuation", () => {
    expect(sanitizeFilename("a/b\\c?:*.pdf")).toBe("a-b-c.pdf");
  });

  it("lowercases extension", () => {
    expect(sanitizeFilename("Photo.JPG")).toBe("Photo.jpg");
  });

  it("returns default when name has no safe characters", () => {
    expect(sanitizeFilename("???")).toBe("file");
  });
});

describe("placeholderToken", () => {
  it("wraps id in mustache resource token", () => {
    expect(placeholderToken("abc")).toBe("{{resource:abc}}");
  });
});

describe("listResources", () => {
  it("returns rows ordered by created_at desc", async () => {
    const orderMock = jest
      .fn()
      .mockResolvedValue({ data: [baseResource], error: null });
    const selectMock = jest.fn().mockReturnValue({ order: orderMock });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ select: selectMock }),
    });
    const result = await listResources();
    expect(orderMock).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(result).toEqual([baseResource]);
  });
});

describe("uploadResource", () => {
  function mockSupabase({
    uploadError = null,
    insertResult,
    removeMock,
  }: {
    uploadError?: { message: string } | null;
    insertResult: { data: unknown; error: unknown };
    removeMock?: jest.Mock;
  }) {
    const uploadMock = jest
      .fn()
      .mockResolvedValue({ data: { path: "x" }, error: uploadError });
    const remove = removeMock ?? jest.fn().mockResolvedValue({ error: null });
    const singleMock = jest.fn().mockResolvedValue(insertResult);
    const selectMock = jest.fn().mockReturnValue({ single: singleMock });
    const insertMock = jest.fn().mockReturnValue({ select: selectMock });

    (getSupabase as jest.Mock).mockReturnValue({
      storage: {
        from: () => ({ upload: uploadMock, remove }),
      },
      from: () => ({ insert: insertMock }),
    });

    return { uploadMock, insertMock, remove };
  }

  it("uploads then inserts a metadata row with sanitized path", async () => {
    const { uploadMock, insertMock } = mockSupabase({
      insertResult: { data: baseResource, error: null },
    });
    const file = new File(["x"], "My Diagram.png", { type: "image/png" });
    Object.defineProperty(file, "size", { value: 1024 });

    const result = await uploadResource(file);
    expect(uploadMock).toHaveBeenCalledWith(
      "00000000-0000-0000-0000-000000000abc/My-Diagram.png",
      file,
      expect.objectContaining({ contentType: "image/png" })
    );
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "00000000-0000-0000-0000-000000000abc",
        bucket: "resources",
        storage_path: "00000000-0000-0000-0000-000000000abc/My-Diagram.png",
        filename: "My Diagram.png",
        mime_type: "image/png",
        size_bytes: 1024,
        label: "My Diagram",
      })
    );
    expect(result).toEqual(baseResource);
  });

  it("throws UploadError if storage upload fails", async () => {
    mockSupabase({
      uploadError: { message: "Quota" },
      insertResult: { data: null, error: null },
    });
    const file = new File(["x"], "a.png", { type: "image/png" });
    await expect(uploadResource(file)).rejects.toBeInstanceOf(UploadError);
  });

  it("rolls back the storage object if the metadata insert fails", async () => {
    const remove = jest.fn().mockResolvedValue({ error: null });
    mockSupabase({
      insertResult: { data: null, error: { message: "DB error" } },
      removeMock: remove,
    });
    const file = new File(["x"], "a.png", { type: "image/png" });
    await expect(uploadResource(file)).rejects.toThrow("DB error");
    expect(remove).toHaveBeenCalledWith([
      "00000000-0000-0000-0000-000000000abc/a.png",
    ]);
  });
});

describe("renameResource", () => {
  it("updates the label after trimming", async () => {
    const singleMock = jest.fn().mockResolvedValue({
      data: { ...baseResource, label: "X" },
      error: null,
    });
    const selectMock = jest.fn().mockReturnValue({ single: singleMock });
    const eqMock = jest.fn().mockReturnValue({ select: selectMock });
    const updateMock = jest.fn().mockReturnValue({ eq: eqMock });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ update: updateMock }),
    });

    const result = await renameResource("r1", "  X  ");
    expect(updateMock).toHaveBeenCalledWith({ label: "X" });
    expect(eqMock).toHaveBeenCalledWith("id", "r1");
    expect(result.label).toBe("X");
  });

  it("throws when label is empty after trim", async () => {
    await expect(renameResource("r1", "   ")).rejects.toThrow(
      "Label is required"
    );
    expect(getSupabase).not.toHaveBeenCalled();
  });
});

describe("deleteResource", () => {
  it("removes storage object then deletes the row", async () => {
    const remove = jest.fn().mockResolvedValue({ error: null });
    const eqMock = jest.fn().mockResolvedValue({ error: null });
    const deleteMock = jest.fn().mockReturnValue({ eq: eqMock });
    (getSupabase as jest.Mock).mockReturnValue({
      storage: { from: () => ({ remove }) },
      from: () => ({ delete: deleteMock }),
    });

    await deleteResource(baseResource);
    expect(remove).toHaveBeenCalledWith(["r1/diagram.png"]);
    expect(eqMock).toHaveBeenCalledWith("id", "r1");
  });

  it("throws if storage remove fails (does not delete the row)", async () => {
    const remove = jest
      .fn()
      .mockResolvedValue({ error: { message: "Storage down" } });
    const deleteMock = jest.fn();
    (getSupabase as jest.Mock).mockReturnValue({
      storage: { from: () => ({ remove }) },
      from: () => ({ delete: deleteMock }),
    });

    await expect(deleteResource(baseResource)).rejects.toThrow("Storage down");
    expect(deleteMock).not.toHaveBeenCalled();
  });
});

describe("getSignedUrl", () => {
  it("returns the signedUrl from Supabase storage", async () => {
    const createSignedUrl = jest.fn().mockResolvedValue({
      data: { signedUrl: "https://signed.example/abc" },
      error: null,
    });
    (getSupabase as jest.Mock).mockReturnValue({
      storage: { from: () => ({ createSignedUrl }) },
    });
    const url = await getSignedUrl(baseResource);
    expect(createSignedUrl).toHaveBeenCalledWith("r1/diagram.png", 3600);
    expect(url).toBe("https://signed.example/abc");
  });

  it("throws if storage returns an error", async () => {
    const createSignedUrl = jest
      .fn()
      .mockResolvedValue({ data: null, error: { message: "Forbidden" } });
    (getSupabase as jest.Mock).mockReturnValue({
      storage: { from: () => ({ createSignedUrl }) },
    });
    await expect(getSignedUrl(baseResource)).rejects.toThrow("Forbidden");
  });
});

describe("listResourcesByIds", () => {
  it("returns empty list without hitting Supabase when ids are empty", async () => {
    const out = await listResourcesByIds([]);
    expect(out).toEqual([]);
    expect(getSupabase).not.toHaveBeenCalled();
  });

  it("issues a single .in() query for the unique ids", async () => {
    const inMock = jest
      .fn()
      .mockResolvedValue({ data: [baseResource], error: null });
    const select = jest.fn().mockReturnValue({ in: inMock });
    (getSupabase as jest.Mock).mockReturnValue({ from: () => ({ select }) });

    const result = await listResourcesByIds(["r1", "r2"]);
    expect(inMock).toHaveBeenCalledWith("id", ["r1", "r2"]);
    expect(result).toEqual([baseResource]);
  });
});

describe("getSignedUrlsByIds", () => {
  it("returns a map with nulls for unknown ids and signed urls for known ones", async () => {
    const inMock = jest
      .fn()
      .mockResolvedValue({ data: [baseResource], error: null });
    const select = jest.fn().mockReturnValue({ in: inMock });
    const createSignedUrl = jest.fn().mockResolvedValue({
      data: { signedUrl: "https://signed/r1" },
      error: null,
    });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ select }),
      storage: { from: () => ({ createSignedUrl }) },
    });

    const out = await getSignedUrlsByIds(["r1", "missing"]);
    expect(out).toEqual({
      r1: {
        url: "https://signed/r1",
        mime: "image/png",
        filename: "Diagram.png",
      },
      missing: { url: null, mime: null, filename: null },
    });
  });

  it("treats createSignedUrl errors as missing url but keeps metadata", async () => {
    const inMock = jest
      .fn()
      .mockResolvedValue({ data: [baseResource], error: null });
    const select = jest.fn().mockReturnValue({ in: inMock });
    const createSignedUrl = jest
      .fn()
      .mockResolvedValue({ data: null, error: { message: "Forbidden" } });
    (getSupabase as jest.Mock).mockReturnValue({
      from: () => ({ select }),
      storage: { from: () => ({ createSignedUrl }) },
    });

    const out = await getSignedUrlsByIds(["r1"]);
    expect(out.r1.url).toBeNull();
    expect(out.r1.filename).toBe("Diagram.png");
    expect(out.r1.mime).toBe("image/png");
  });

  it("returns empty map for empty input without calling Supabase", async () => {
    const out = await getSignedUrlsByIds([]);
    expect(out).toEqual({});
    expect(getSupabase).not.toHaveBeenCalled();
  });
});
