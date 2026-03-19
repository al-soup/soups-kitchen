import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
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

function makeScore(
  date: string,
  score: number,
  ids: number[] = []
): DailyHabitScore {
  return { completed_date: date, total_score: score, habit_ids: ids };
}

describe("HabitScoreGraph", () => {
  it("renders without crashing with empty scores", () => {
    render(
      <HabitScoreGraph
        scores={[]}
        loading={false}
        error={null}
        actionType={1}
      />
    );
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("renders day cells for a year (grid + legend)", () => {
    render(
      <HabitScoreGraph
        scores={[]}
        loading={false}
        error={null}
        actionType={1}
      />
    );
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
    render(
      <HabitScoreGraph
        scores={scores}
        loading={false}
        error={null}
        actionType={1}
      />
    );

    const cells = screen.getAllByRole("gridcell");
    const level3 = cells.filter((c) => c.getAttribute("data-level") === "3");
    const level5 = cells.filter((c) => c.getAttribute("data-level") === "5");
    expect(level3.length).toBeGreaterThanOrEqual(1);
    expect(level5.length).toBeGreaterThanOrEqual(1);
  });

  it("shows every-other day labels", () => {
    render(
      <HabitScoreGraph
        scores={[]}
        loading={false}
        error={null}
        actionType={1}
      />
    );
    for (const day of ["Mon", "Wed", "Fri", "Sun"]) {
      expect(screen.getByText(day)).toBeInTheDocument();
    }
    for (const day of ["Tue", "Thu", "Sat"]) {
      expect(screen.queryByText(day)).not.toBeInTheDocument();
    }
  });

  it("renders month labels", () => {
    render(
      <HabitScoreGraph
        scores={[]}
        loading={false}
        error={null}
        actionType={1}
      />
    );
    expect(screen.getByText("Jan")).toBeInTheDocument();
  });

  it("renders legend with Less and More", () => {
    render(
      <HabitScoreGraph
        scores={[]}
        loading={false}
        error={null}
        actionType={1}
      />
    );
    expect(screen.getByText("Less")).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument();
  });

  it("sets data-loading on cells when loading", () => {
    render(
      <HabitScoreGraph scores={[]} loading={true} error={null} actionType={1} />
    );
    const cells = screen.getAllByRole("gridcell");
    const loadingCells = cells.filter((c) => c.hasAttribute("data-loading"));
    expect(loadingCells.length).toBeGreaterThan(0);
  });

  it("shows error message when error is set", () => {
    render(
      <HabitScoreGraph
        scores={[]}
        loading={false}
        error="Something went wrong"
        actionType={1}
      />
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("disables scroll buttons when loading", () => {
    render(
      <HabitScoreGraph scores={[]} loading={true} error={null} actionType={1} />
    );
    const leftBtn = screen.getByLabelText("Scroll left");
    const rightBtn = screen.getByLabelText("Scroll right");
    expect(leftBtn).toBeDisabled();
    expect(rightBtn).toBeDisabled();
  });

  it("calls onSelectDate with date when clicking a scored day", () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const onSelectDate = jest.fn();

    render(
      <HabitScoreGraph
        scores={[makeScore(dateStr, 3, [1, 2, 3])]}
        loading={false}
        error={null}
        actionType={1}
        selectedDate={null}
        onSelectDate={onSelectDate}
      />
    );

    // Scored days render as buttons; find one with data-level > 0
    const buttons = screen
      .getAllByRole("gridcell")
      .filter(
        (c) => c.tagName === "BUTTON" && c.getAttribute("data-level") !== "0"
      );
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(buttons[0]);
    expect(onSelectDate).toHaveBeenCalledWith(dateStr);
  });

  it("calls onSelectDate(null) when clicking already-selected day", () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const onSelectDate = jest.fn();

    render(
      <HabitScoreGraph
        scores={[makeScore(dateStr, 3, [1, 2, 3])]}
        loading={false}
        error={null}
        actionType={1}
        selectedDate={dateStr}
        onSelectDate={onSelectDate}
      />
    );

    const buttons = screen
      .getAllByRole("gridcell")
      .filter(
        (c) => c.tagName === "BUTTON" && c.getAttribute("data-level") !== "0"
      );
    fireEvent.click(buttons[0]);
    expect(onSelectDate).toHaveBeenCalledWith(null);
  });

  it("zero-score days render as div, not button", () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    render(
      <HabitScoreGraph
        scores={[makeScore(dateStr, 3, [1, 2, 3])]}
        loading={false}
        error={null}
        actionType={1}
        onSelectDate={jest.fn()}
      />
    );

    const zeroScoreDivs = screen
      .getAllByRole("gridcell")
      .filter(
        (c) => c.tagName === "DIV" && c.getAttribute("data-level") === "0"
      );
    // Most days have no score so there should be many divs
    expect(zeroScoreDivs.length).toBeGreaterThan(300);
    // None of them should be buttons
    for (const div of zeroScoreDivs) {
      expect(div.tagName).not.toBe("BUTTON");
    }
  });

  it("sets data-color-type on outer div", () => {
    const { container, rerender } = render(
      <HabitScoreGraph
        scores={[]}
        loading={false}
        error={null}
        actionType={2}
      />
    );
    expect(container.firstChild).toHaveAttribute("data-color-type", "2");

    rerender(
      <HabitScoreGraph
        scores={[]}
        loading={false}
        error={null}
        actionType={3}
      />
    );
    expect(container.firstChild).toHaveAttribute("data-color-type", "3");
  });
});
