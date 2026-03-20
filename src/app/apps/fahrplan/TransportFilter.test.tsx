import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import type { StationboardConnection } from "./types";
import type { TransportFilterKey } from "./constants";
import { ALL_FILTER_KEYS } from "./constants";
import { TransportFilter } from "./TransportFilter";
import { filterConnections } from "./DepartureBoard";

function conn(type: string): StationboardConnection {
  return {
    time: new Date().toISOString(),
    "*G": "1",
    "*L": "1",
    "*Z": "1",
    type,
    line: "1",
    operator: "X",
    color: "~",
    type_name: type,
    terminal: { id: "1", name: "A", lon: 0, lat: 0 },
  };
}

describe("filterConnections", () => {
  const connections = [conn("train"), conn("tram"), conn("bus"), conn("ship")];

  it("returns all when every filter is active", () => {
    const active = new Set<TransportFilterKey>(ALL_FILTER_KEYS);
    expect(filterConnections(connections, active)).toHaveLength(4);
  });

  it("filters to selected types only", () => {
    const active = new Set<TransportFilterKey>(["Tram"]);
    const result = filterConnections(connections, active);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("tram");
  });
});

describe("TransportFilter", () => {
  it("disables chips for unavailable types", () => {
    const available = new Set<TransportFilterKey>(["Train", "Tram"]);
    render(
      <TransportFilter
        active={new Set(ALL_FILTER_KEYS)}
        available={available}
        onChange={() => {}}
      />
    );
    expect(screen.getByText("Bus").closest("button")).toBeDisabled();
    expect(screen.getByText("Train").closest("button")).toBeEnabled();
  });

  it("calls onChange when toggling a chip", () => {
    const onChange = jest.fn();
    render(
      <TransportFilter
        active={new Set(ALL_FILTER_KEYS)}
        available={new Set(ALL_FILTER_KEYS)}
        onChange={onChange}
      />
    );
    fireEvent.click(screen.getByText("Bus"));
    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0] as Set<TransportFilterKey>;
    expect(result.has("Bus")).toBe(false);
    expect(result.has("Train")).toBe(true);
  });
});
