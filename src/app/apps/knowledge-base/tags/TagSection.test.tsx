import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TagSection } from "./TagSection";
import { DuplicateTagError } from "./api";

const baseProps = {
  title: "Topics",
  placeholder: "Add a topic",
  type: "topic" as const,
  tags: [],
  onCreate: jest.fn(),
  onRename: jest.fn(),
  onDelete: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe("TagSection", () => {
  it("renders heading and empty state when no tags", () => {
    render(<TagSection {...baseProps} />);
    expect(screen.getByRole("heading", { name: /Topics/ })).toBeInTheDocument();
    expect(screen.getByText("No tags yet.")).toBeInTheDocument();
  });

  it("renders tag rows when tags exist", () => {
    render(
      <TagSection
        {...baseProps}
        tags={[
          { id: "1", name: "System Design", type: "topic" },
          { id: "2", name: "Databases", type: "topic" },
        ]}
      />
    );
    expect(
      screen.getByRole("button", { name: /rename system design/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /rename databases/i })
    ).toBeInTheDocument();
  });

  it("submit calls onCreate with trimmed name and type, then clears input", async () => {
    const onCreate = jest.fn().mockResolvedValue(undefined);
    render(<TagSection {...baseProps} onCreate={onCreate} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "  Web Dev  " } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    await waitFor(() =>
      expect(onCreate).toHaveBeenCalledWith("Web Dev", "topic")
    );
    expect(input.value).toBe("");
  });

  it("Add is disabled when input is empty or whitespace", () => {
    render(<TagSection {...baseProps} />);
    const addBtn = screen.getByRole("button", { name: "Add" });
    expect(addBtn).toBeDisabled();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "   " },
    });
    expect(addBtn).toBeDisabled();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "X" } });
    expect(addBtn).toBeEnabled();
  });

  it("maps DuplicateTagError to 'Already exists' and keeps draft", async () => {
    const onCreate = jest
      .fn()
      .mockRejectedValue(new DuplicateTagError("System Design"));
    render(<TagSection {...baseProps} onCreate={onCreate} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "System Design" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    await waitFor(() =>
      expect(screen.getByText("Already exists")).toBeInTheDocument()
    );
    expect(screen.getByRole("textbox")).toHaveValue("System Design");
  });
});
