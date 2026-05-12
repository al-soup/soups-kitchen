import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TagRow } from "./TagRow";
import { DuplicateTagError } from "./api";

const tag = { id: "t1", name: "Caching", type: "concept" as const };

describe("TagRow", () => {
  it("renders the tag name", () => {
    render(<TagRow tag={tag} onRename={jest.fn()} onDelete={jest.fn()} />);
    expect(
      screen.getByRole("button", { name: /rename caching/i })
    ).toHaveTextContent("Caching");
  });

  it("clicking name switches to edit input focused with value selected", () => {
    render(<TagRow tag={tag} onRename={jest.fn()} onDelete={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /rename caching/i }));
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input).toHaveValue("Caching");
    expect(input).toHaveFocus();
  });

  it("Enter commits the rename via onRename", async () => {
    const onRename = jest.fn().mockResolvedValue(undefined);
    render(<TagRow tag={tag} onRename={onRename} onDelete={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /rename caching/i }));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "  Cache Strategies  " } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() =>
      expect(onRename).toHaveBeenCalledWith("t1", "Cache Strategies")
    );
  });

  it("Escape cancels and does not call onRename", () => {
    const onRename = jest.fn();
    render(<TagRow tag={tag} onRename={onRename} onDelete={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /rename caching/i }));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Different" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(onRename).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: /rename caching/i })
    ).toHaveTextContent("Caching");
  });

  it("submitting same name closes the editor without calling onRename", () => {
    const onRename = jest.fn();
    render(<TagRow tag={tag} onRename={onRename} onDelete={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /rename caching/i }));
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onRename).not.toHaveBeenCalled();
  });

  it("empty rename shows inline error", () => {
    const onRename = jest.fn();
    render(<TagRow tag={tag} onRename={onRename} onDelete={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /rename caching/i }));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "  " } });
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onRename).not.toHaveBeenCalled();
    expect(screen.getByText("Name required")).toBeInTheDocument();
  });

  it("maps DuplicateTagError to 'Already exists'", async () => {
    const onRename = jest
      .fn()
      .mockRejectedValue(new DuplicateTagError("Taken"));
    render(<TagRow tag={tag} onRename={onRename} onDelete={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /rename caching/i }));
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Taken" },
    });
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    await waitFor(() =>
      expect(screen.getByText("Already exists")).toBeInTheDocument()
    );
  });

  it("delete calls onDelete after confirm", async () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);
    const onDelete = jest.fn().mockResolvedValue(undefined);
    render(<TagRow tag={tag} onRename={jest.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", { name: /delete caching/i }));
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith("t1"));
    confirmSpy.mockRestore();
  });

  it("delete does nothing if confirm is cancelled", () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);
    const onDelete = jest.fn();
    render(<TagRow tag={tag} onRename={jest.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", { name: /delete caching/i }));
    expect(onDelete).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});
