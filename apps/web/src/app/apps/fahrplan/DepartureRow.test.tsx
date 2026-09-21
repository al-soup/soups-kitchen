import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { DepartureRow } from "./DepartureRow";
import type { StationboardConnection } from "./types";

function makeConnection(
  overrides: Partial<StationboardConnection> = {}
): StationboardConnection {
  return {
    time: new Date(Date.now() + 5 * 60000).toISOString(),
    "*G": "1",
    "*L": "1",
    "*Z": "12345",
    type: "train",
    line: "S8",
    operator: "SBB",
    color: "0078c8~fff~",
    type_name: "S-Bahn",
    terminal: { id: "1", name: "Zurich HB", lon: 8.54, lat: 47.38 },
    ...overrides,
  };
}

describe("DepartureRow", () => {
  it("renders line badge with correct text and colors", () => {
    const c = makeConnection({ color: "e3000f~ffffff~" });
    render(<DepartureRow connection={c} now={Date.now()} />);
    const badge = screen.getByText("S8");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ backgroundColor: "#e3000f", color: "#ffffff" });
  });

  it('shows "now" for past departures', () => {
    const c = makeConnection({
      time: new Date(Date.now() - 60000).toISOString(),
    });
    render(<DepartureRow connection={c} now={Date.now()} />);
    expect(screen.getByText("now")).toBeInTheDocument();
  });

  it("shows minutes format for < 60 min", () => {
    const now = Date.now();
    const c = makeConnection({
      time: new Date(now + 25 * 60000).toISOString(),
    });
    render(<DepartureRow connection={c} now={now} />);
    expect(screen.getByText("25'")).toBeInTheDocument();
  });

  it("shows hours+minutes for >= 60 min", () => {
    const now = Date.now();
    const c = makeConnection({
      time: new Date(now + 90 * 60000).toISOString(),
    });
    render(<DepartureRow connection={c} now={now} />);
    expect(screen.getByText("1h 30'")).toBeInTheDocument();
  });

  it("shows delay badge when dep_delay present", () => {
    const c = makeConnection({ dep_delay: "3" });
    render(<DepartureRow connection={c} now={Date.now()} />);
    expect(screen.getByText("+3")).toBeInTheDocument();
  });

  it("does not show delay when absent", () => {
    const c = makeConnection({ dep_delay: undefined });
    render(<DepartureRow connection={c} now={Date.now()} />);
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it("parses color format f00~fff~", () => {
    const c = makeConnection({ color: "f00~fff~" });
    render(<DepartureRow connection={c} now={Date.now()} />);
    const badge = screen.getByText("S8");
    expect(badge).toHaveStyle({ backgroundColor: "#f00", color: "#fff" });
  });

  it("falls back to transport color when color is empty", () => {
    const c = makeConnection({ color: "", type: "bus" });
    render(<DepartureRow connection={c} now={Date.now()} />);
    const badge = screen.getByText("S8");
    expect(badge).toHaveStyle({ backgroundColor: "#8dc63f" });
  });
});
