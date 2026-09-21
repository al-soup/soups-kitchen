import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { StationSearch } from "./StationSearch";

jest.mock("./api", () => ({
  fetchCompletions: jest.fn(),
}));

const { fetchCompletions } = jest.requireMock("./api") as {
  fetchCompletions: jest.Mock;
};

const mockResults = [
  { label: "Zurich HB", iconclass: "sl-icon-type-train" },
  { label: "Zurich Stadelhofen", iconclass: "sl-icon-type-strain" },
  { label: "Zurich Oerlikon", iconclass: "sl-icon-type-train" },
];

beforeEach(() => {
  jest.useFakeTimers();
  fetchCompletions.mockReset();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("StationSearch", () => {
  it("renders input with placeholder", () => {
    render(<StationSearch onSelect={jest.fn()} />);
    expect(
      screen.getByPlaceholderText("Search station...")
    ).toBeInTheDocument();
  });

  it("calls onSelect when option clicked", async () => {
    fetchCompletions.mockResolvedValue(mockResults);
    const onSelect = jest.fn();
    render(<StationSearch onSelect={onSelect} />);

    fireEvent.change(screen.getByPlaceholderText("Search station..."), {
      target: { value: "Zurich" },
    });
    jest.advanceTimersByTime(300);
    await waitFor(() =>
      expect(screen.getByText("Zurich HB")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText("Zurich HB"));
    expect(onSelect).toHaveBeenCalledWith("Zurich HB");
  });

  it("ArrowDown/Up changes active item, Enter selects", async () => {
    fetchCompletions.mockResolvedValue(mockResults);
    const onSelect = jest.fn();
    render(<StationSearch onSelect={onSelect} />);

    const input = screen.getByPlaceholderText("Search station...");
    fireEvent.change(input, { target: { value: "Zurich" } });
    jest.advanceTimersByTime(300);
    await waitFor(() =>
      expect(screen.getByText("Zurich HB")).toBeInTheDocument()
    );

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByText("Zurich HB").closest("button")).toHaveAttribute(
      "aria-selected",
      "true"
    );

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(
      screen.getByText("Zurich Stadelhofen").closest("button")
    ).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(screen.getByText("Zurich HB").closest("button")).toHaveAttribute(
      "aria-selected",
      "true"
    );

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("Zurich HB");
  });

  it("Escape closes dropdown", async () => {
    fetchCompletions.mockResolvedValue(mockResults);
    render(<StationSearch onSelect={jest.fn()} />);

    const input = screen.getByPlaceholderText("Search station...");
    fireEvent.change(input, { target: { value: "Zurich" } });
    jest.advanceTimersByTime(300);
    await waitFor(() =>
      expect(screen.getByText("Zurich HB")).toBeInTheDocument()
    );

    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByText("Zurich HB")).not.toBeInTheDocument();
  });
});
