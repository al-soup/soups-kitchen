import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { StartScreen } from "./StartScreen";

const baseProps = {
  lang: "de" as const,
  onLangChange: () => {},
  counts: { friends: 4, couple: 6 },
  duration: 32,
  onDurationChange: () => {},
  sortByIntensity: true,
  onSortChange: () => {},
  categories: ["Ethics", "Fun"],
  categoryCounts: { Ethics: 1, Fun: 2 },
  deselected: new Set<string>(),
  onToggleCategory: () => {},
  onSelectAllCategories: () => {},
  onPick: () => {},
};

describe("StartScreen categories", () => {
  it("renders a localized chip with a count per category", () => {
    render(<StartScreen {...baseProps} />);
    const fun = screen.getByRole("button", { name: /Spaß/ });
    expect(fun).toHaveTextContent("2");
    expect(screen.getByRole("button", { name: /Ethik/ })).toHaveTextContent(
      "1"
    );
  });

  it("renders English labels when lang is en", () => {
    render(<StartScreen {...baseProps} lang="en" />);
    expect(screen.getByRole("button", { name: /Fun/ })).toBeInTheDocument();
  });

  it("marks deselected chips as not pressed", () => {
    render(<StartScreen {...baseProps} deselected={new Set(["Fun"])} />);
    expect(screen.getByRole("button", { name: /Spaß/ })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(screen.getByRole("button", { name: /Ethik/ })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("calls onToggleCategory with the clicked key", () => {
    const onToggleCategory = jest.fn();
    render(<StartScreen {...baseProps} onToggleCategory={onToggleCategory} />);
    fireEvent.click(screen.getByRole("button", { name: /Spaß/ }));
    expect(onToggleCategory).toHaveBeenCalledWith("Fun");
  });

  it("calls onSelectAllCategories from the all chip", () => {
    const onSelectAllCategories = jest.fn();
    render(
      <StartScreen
        {...baseProps}
        deselected={new Set(["Fun"])}
        onSelectAllCategories={onSelectAllCategories}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Alle" }));
    expect(onSelectAllCategories).toHaveBeenCalledTimes(1);
  });

  it("hides the category row when there are no categories", () => {
    render(<StartScreen {...baseProps} categories={[]} />);
    expect(screen.queryByText("Kategorien")).not.toBeInTheDocument();
  });
});

describe("StartScreen groups", () => {
  it("disables a group with no matching questions", () => {
    render(<StartScreen {...baseProps} counts={{ friends: 0, couple: 6 }} />);
    expect(screen.getByText("Freunde").closest("button")).toBeDisabled();
    expect(screen.getByText("Paar").closest("button")).toBeEnabled();
  });

  it("calls onPick with the chosen group", () => {
    const onPick = jest.fn();
    render(<StartScreen {...baseProps} onPick={onPick} />);
    fireEvent.click(screen.getByText("Paar"));
    expect(onPick).toHaveBeenCalledWith("couple");
  });
});
