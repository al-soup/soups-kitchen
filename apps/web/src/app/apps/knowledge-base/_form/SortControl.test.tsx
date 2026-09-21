import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { SortControl } from "./SortControl";

describe("SortControl", () => {
  it("renders one button per sort mode", () => {
    render(<SortControl value="newest" onChange={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Newest" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Oldest" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "By topic" })
    ).toBeInTheDocument();
  });

  it("marks only the active mode as pressed", () => {
    render(<SortControl value="topic" onChange={jest.fn()} />);
    expect(screen.getByRole("button", { name: "By topic" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Newest" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("calls onChange with the clicked mode", () => {
    const onChange = jest.fn();
    render(<SortControl value="newest" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Oldest" }));
    expect(onChange).toHaveBeenCalledWith("oldest");
  });

  it("still calls onChange when the active mode is clicked", () => {
    const onChange = jest.fn();
    render(<SortControl value="oldest" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Oldest" }));
    expect(onChange).toHaveBeenCalledWith("oldest");
  });
});
