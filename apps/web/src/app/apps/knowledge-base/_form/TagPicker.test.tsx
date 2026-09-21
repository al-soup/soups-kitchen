jest.mock("@/app/apps/knowledge-base/tags/api", () => ({
  createTag: jest.fn(),
  DuplicateTagError: class extends Error {
    constructor(name: string) {
      super(`Tag "${name}" already exists`);
      this.name = "DuplicateTagError";
    }
  },
}));

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TagPicker } from "./TagPicker";
import {
  createTag,
  DuplicateTagError,
} from "@/app/apps/knowledge-base/tags/api";
import type { Tag } from "@/lib/supabase/types";

const topics: Tag[] = [
  { id: "t1", name: "System Design", type: "topic" },
  { id: "t2", name: "Databases", type: "topic" },
];
const concepts: Tag[] = [
  { id: "c1", name: "DB Indexing", type: "concept" },
  { id: "c2", name: "Caching", type: "concept" },
];

beforeEach(() => jest.clearAllMocks());

function renderPicker(
  extra: {
    selectedIds?: Set<string>;
    onChange?: jest.Mock;
    onTagCreated?: jest.Mock;
  } = {}
) {
  const onChange = extra.onChange ?? jest.fn();
  const onTagCreated = extra.onTagCreated ?? jest.fn();
  render(
    <TagPicker
      topics={topics}
      concepts={concepts}
      selectedIds={extra.selectedIds ?? new Set()}
      onChange={onChange}
      onTagCreated={onTagCreated}
    />
  );
  return { onChange, onTagCreated };
}

describe("TagPicker", () => {
  it("renders both lists with all tags initially", () => {
    renderPicker();
    expect(
      screen.getByRole("button", { name: "System Design" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Databases" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "DB Indexing" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Caching" })).toBeInTheDocument();
  });

  it("filters both lists by search query", () => {
    renderPicker();
    // "i" appears in: "System Design", "DB Indexing", "Caching" — not in "Databases"
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "i" },
    });
    expect(
      screen.getByRole("button", { name: "System Design" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "DB Indexing" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Caching" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Databases" })
    ).not.toBeInTheDocument();
  });

  it("toggles selection when a pill is clicked", () => {
    const { onChange } = renderPicker();
    fireEvent.click(screen.getByRole("button", { name: "Databases" }));
    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0] as Set<string>;
    expect(next.has("t2")).toBe(true);
  });

  it("deselects when an already-selected pill is clicked", () => {
    const { onChange } = renderPicker({
      selectedIds: new Set(["t2"]),
    });
    fireEvent.click(screen.getByRole("button", { name: "Databases" }));
    const next = onChange.mock.calls[0][0] as Set<string>;
    expect(next.has("t2")).toBe(false);
  });

  it("shows create buttons after a short delay when query has no matches", async () => {
    renderPicker();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "Brand New Tag" },
    });
    const topicBtn = await screen.findByRole("button", { name: "+ Topic" });
    const conceptBtn = await screen.findByRole("button", { name: "+ Concept" });
    expect(topicBtn).not.toBeDisabled();
    expect(conceptBtn).not.toBeDisabled();
  });

  it("does not show create buttons for queries shorter than 2 chars", () => {
    renderPicker();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "x" },
    });
    // Buttons remain aria-hidden / disabled — queryByRole excludes hidden.
    expect(
      screen.queryByRole("button", { name: "+ Topic" })
    ).not.toBeInTheDocument();
  });

  it("does not show create buttons when an exact match exists", () => {
    renderPicker();
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "Caching" },
    });
    expect(
      screen.queryByRole("button", { name: "+ Topic" })
    ).not.toBeInTheDocument();
  });

  it("creates a tag and auto-selects it", async () => {
    const newTag: Tag = { id: "new", name: "BrandNew", type: "topic" };
    (createTag as jest.Mock).mockResolvedValue(newTag);
    const { onChange, onTagCreated } = renderPicker();

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "BrandNew" },
    });
    const topicBtn = await screen.findByRole("button", { name: "+ Topic" });
    fireEvent.click(topicBtn);

    await waitFor(() =>
      expect(createTag).toHaveBeenCalledWith("BrandNew", "topic")
    );
    expect(onTagCreated).toHaveBeenCalledWith(newTag);
    const lastCall = onChange.mock.calls.at(-1);
    expect(lastCall?.[0].has("new")).toBe(true);
  });

  it("maps DuplicateTagError when creating", async () => {
    (createTag as jest.Mock).mockRejectedValue(
      new DuplicateTagError("BrandNew")
    );
    renderPicker();

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "BrandNew" },
    });
    const topicBtn = await screen.findByRole("button", { name: "+ Topic" });
    fireEvent.click(topicBtn);

    await waitFor(() =>
      expect(screen.getByText("Already exists")).toBeInTheDocument()
    );
  });
});
