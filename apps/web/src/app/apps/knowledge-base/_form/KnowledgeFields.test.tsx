jest.mock("@/app/apps/knowledge-base/tags/api", () => ({
  listTags: jest.fn().mockResolvedValue([]),
}));
jest.mock("./ResourcePickerModal", () => ({
  ResourcePickerModal: () => null,
}));

import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { KnowledgeFields } from "./KnowledgeFields";
import type { KnowledgeFormInitial } from "./types";

const empty: KnowledgeFormInitial = {
  question: "",
  summary: "",
  detail: "",
  tagIds: [],
};

describe("KnowledgeFields insert code block", () => {
  it("inserts a fenced code block at the cursor and places caret inside", async () => {
    let value: KnowledgeFormInitial = { ...empty, detail: "before after" };
    const onChange = jest.fn((next: KnowledgeFormInitial) => {
      value = next;
    });
    render(<KnowledgeFields value={value} onChange={onChange} />);

    const textarea = await screen.findByPlaceholderText(/Longer explanation/);
    // Place caret between "before" and " after".
    (textarea as HTMLTextAreaElement).setSelectionRange(6, 6);

    fireEvent.click(screen.getByRole("button", { name: "Insert code block" }));

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const next = onChange.mock.calls.at(-1)?.[0] as KnowledgeFormInitial;
    expect(next.detail).toBe("before\n```\n\n```\n after");
  });

  it("does not add a leading newline when cursor is at line start", async () => {
    const value: KnowledgeFormInitial = { ...empty, detail: "" };
    const onChange = jest.fn();
    render(<KnowledgeFields value={value} onChange={onChange} />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Insert code block" })
    );

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const next = onChange.mock.calls.at(-1)?.[0] as KnowledgeFormInitial;
    expect(next.detail).toBe("```\n\n```");
  });
});
