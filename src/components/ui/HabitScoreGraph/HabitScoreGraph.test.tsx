import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { HabitScoreGraph } from "./HabitScoreGraph";
import type { DailyHabitScore } from "@/lib/supabase/types";

// Mock scrollBy/scrollWidth for scroll logic
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
    configurable: true,
    get: () => 1000,
  });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get: () => 500,
  });
});

function makeScore(date: string, score: number, ids: number[] = []): DailyHabitScore {
  return { completed_date: date, total_score: score, habit_ids: ids };
}

describe("HabitScoreGraph", () => {
  it("renders without crashing with empty scores", () => {
    render(<HabitScoreGraph scores={[]} loading={false} error={null} actionType={1} />);
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("renders day cells for a year (grid + legend)", () => {
    render(<HabitScoreGraph scores={[]} loading={false} error={null} actionType={1} />);
    const cells = screen.getAllByRole("gridcell");
    // ~365 grid cells + 7 legend cells = ~372-384
    expect(cells.length).toBeGreaterThanOrEqual(372);
    expect(cells.length).toBeLessThanOrEqual(384);
  });

  it("sets correct data-level for given scores", () => {
    const scores = [
      makeScore("2025-06-01", 3, [1, 2, 3]),
      makeScore("2025-06-02", 5, [1, 2, 3, 4, 5]),
    ];
    render(<HabitScoreGraph scores={scores} loading={false} error={null} actionType={1} />);

    const cells = screen.getAllByRole("gridcell");
    const level3 = cells.filter((c) => c.getAttribute("data-level") === "3");
    const level5 = cells.filter((c) => c.getAttribute("data-level") === "5");
    expect(level3.length).toBeGreaterThanOrEqual(1);
    expect(level5.length).toBeGreaterThanOrEqual(1);
  });

  it("shows every-other day labels", () => {
    render(<HabitScoreGraph scores={[]} loading={false} error={null} actionType={1} />);
    for (const day of ["Mon", "Wed", "Fri", "Sun"]) {
      expect(screen.getByText(day)).toBeInTheDocument();
    }
    for (const day of ["Tue", "Thu", "Sat"]) {
      expect(screen.queryByText(day)).not.toBeInTheDocument();
    }
  });

  it("renders month labels", () => {
    render(<HabitScoreGraph scores={[]} loading={false} error={null} actionType={1} />);
    expect(screen.getByText("Jan")).toBeInTheDocument();
  });

  it("renders legend with Less and More", () => {
    render(<HabitScoreGraph scores={[]} loading={false} error={null} actionType={1} />);
    expect(screen.getByText("Less")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
  });

  it("sets data-loading on cells when loading", () => {
    render(<HabitScoreGraph scores={[]} loading={true} error={null} actionType={1} />);
    const cells = screen.getAllByRole("gridcell");
    const loadingCells = cells.filter((c) => c.hasAttribute("data-loading"));
    expect(loadingCells.length).toBeGreaterThan(0);
  });

  it("shows error message when error is set", () => {
    render(<HabitScoreGraph scores={[]} loading={false} error="Something went wrong" actionType={1} />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("disables scroll buttons when loading", () => {
    render(<HabitScoreGraph scores={[]} loading={true} error={null} actionType={1} />);
    const leftBtn = screen.getByLabelText("Scroll left");
    const rightBtn = screen.getByLabelText("Scroll right");
    expect(leftBtn).toBeDisabled();
    expect(rightBtn).toBeDisabled();
  });

  it("sets data-color-type on outer div", () => {
    const { container, rerender } = render(
      <HabitScoreGraph scores={[]} loading={false} error={null} actionType={2} />,
    );
    expect(container.firstChild).toHaveAttribute("data-color-type", "2");

    rerender(
      <HabitScoreGraph scores={[]} loading={false} error={null} actionType={3} />,
    );
    expect(container.firstChild).toHaveAttribute("data-color-type", "3");
  });
});
