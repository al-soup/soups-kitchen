import { render, screen, fireEvent } from "@testing-library/react";
import { PillFilter, type PillFilterItem } from "./PillFilter";

const items: PillFilterItem[] = [
  { label: "TypeScript", count: 4 },
  { label: "Docker", count: 2 },
  { label: "Go", count: 1 },
];

function MockIcon({ size }: { size?: number }) {
  return <svg data-testid="icon" width={size} />;
}

describe("PillFilter", () => {
  it("renders all items with labels and counts", () => {
    render(<PillFilter items={items} value={null} onChange={() => {}} />);

    expect(screen.getByText("TypeScript (4)")).toBeTruthy();
    expect(screen.getByText("Docker (2)")).toBeTruthy();
    expect(screen.getByText("Go (1)")).toBeTruthy();
  });

  it("calls onChange with label on click", () => {
    const onChange = jest.fn();
    render(<PillFilter items={items} value={null} onChange={onChange} />);

    fireEvent.click(screen.getByText("Docker (2)"));
    expect(onChange).toHaveBeenCalledWith("Docker");
  });

  it("calls onChange with null when clicking the active pill", () => {
    const onChange = jest.fn();
    render(<PillFilter items={items} value="Docker" onChange={onChange} />);

    fireEvent.click(screen.getByText("Docker (2)"));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("applies active class to the selected pill", () => {
    render(<PillFilter items={items} value="Go" onChange={() => {}} />);

    const activeBtn = screen.getByText("Go (1)");
    expect(activeBtn.className).toContain("pillActive");

    const inactiveBtn = screen.getByText("TypeScript (4)");
    expect(inactiveBtn.className).not.toContain("pillActive");
  });

  it("renders icons when provided", () => {
    const itemsWithIcon: PillFilterItem[] = [
      { label: "Go", count: 1, icon: MockIcon },
    ];
    render(
      <PillFilter items={itemsWithIcon} value={null} onChange={() => {}} />
    );

    expect(screen.getByTestId("icon")).toBeTruthy();
  });

  it("renders nothing when items is empty", () => {
    const { container } = render(
      <PillFilter items={[]} value={null} onChange={() => {}} />
    );
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });
});
