import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActionRow, type SelectionEntry } from "./ActionRow";

const action = {
  id: 1,
  name: "Push-ups",
  description: null,
  type: 1 as const,
  level: 2,
};

const entry: SelectionEntry = { note: "", completedAt: "2026-02-26T10:10" };

describe("ActionRow", () => {
  it("renders action name and level badge", () => {
    render(
      <ActionRow
        action={action}
        selected={false}
        selectionEntry={undefined}
        onChange={jest.fn()}
        disabled={false}
      />
    );
    expect(screen.getByText("Push-ups")).toBeInTheDocument();
    expect(screen.getByText("L2")).toBeInTheDocument();
  });

  it("checkbox calls onChange(id, true) when checked", () => {
    const onChange = jest.fn();
    render(
      <ActionRow
        action={action}
        selected={false}
        selectionEntry={undefined}
        onChange={onChange}
        disabled={false}
      />
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(1, true);
  });

  it("checkbox calls onChange(id, false) when unchecked", () => {
    const onChange = jest.fn();
    render(
      <ActionRow
        action={action}
        selected={true}
        selectionEntry={entry}
        onChange={onChange}
        disabled={false}
      />
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledWith(1, false);
  });

  it("clicking row body selects when not selected", () => {
    const onChange = jest.fn();
    render(
      <ActionRow
        action={action}
        selected={false}
        selectionEntry={undefined}
        onChange={onChange}
        disabled={false}
      />
    );
    fireEvent.click(screen.getByText("Push-ups"));
    expect(onChange).toHaveBeenCalledWith(1, true);
  });

  it("expansion shows note and date/time fields after select+expand", () => {
    const onChange = jest.fn();
    const { rerender, container } = render(
      <ActionRow
        action={action}
        selected={false}
        selectionEntry={undefined}
        onChange={onChange}
        disabled={false}
      />
    );
    // Click row → selects + expands
    fireEvent.click(screen.getByText("Push-ups"));
    // Parent now provides selected=true and a selectionEntry
    rerender(
      <ActionRow
        action={action}
        selected={true}
        selectionEntry={entry}
        onChange={onChange}
        disabled={false}
      />
    );
    expect(screen.getByPlaceholderText("Add a note...")).toBeInTheDocument();
    expect(container.querySelector('input[type="date"]')).toBeInTheDocument();
    expect(container.querySelector('input[type="time"]')).toBeInTheDocument();
  });

  it("expansion hides when checkbox is unchecked", () => {
    const onChange = jest.fn();
    render(
      <ActionRow
        action={action}
        selected={true}
        selectionEntry={entry}
        onChange={onChange}
        disabled={false}
      />
    );
    // Expand via row click
    fireEvent.click(screen.getByText("Push-ups"));
    expect(screen.getByPlaceholderText("Add a note...")).toBeInTheDocument();
    // Uncheck
    fireEvent.click(screen.getByRole("checkbox"));
    expect(
      screen.queryByPlaceholderText("Add a note...")
    ).not.toBeInTheDocument();
  });

  it("date change to non-today sets time to 10:10", () => {
    const onChange = jest.fn();
    render(
      <ActionRow
        action={action}
        selected={true}
        selectionEntry={entry}
        onChange={onChange}
        disabled={false}
      />
    );
    fireEvent.click(screen.getByText("Push-ups"));
    const dateInput = document.querySelector(
      'input[type="date"]'
    ) as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: "2025-01-01" } });
    expect(onChange).toHaveBeenCalledWith(
      1,
      true,
      "completedAt",
      "2025-01-01T10:10"
    );
  });

  it("does nothing when disabled and row is clicked", () => {
    const onChange = jest.fn();
    render(
      <ActionRow
        action={action}
        selected={false}
        selectionEntry={undefined}
        onChange={onChange}
        disabled={true}
      />
    );
    fireEvent.click(screen.getByText("Push-ups"));
    expect(onChange).not.toHaveBeenCalled();
  });
});
