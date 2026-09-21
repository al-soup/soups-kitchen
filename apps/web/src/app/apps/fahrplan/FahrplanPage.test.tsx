import "@testing-library/jest-dom";
import { render, screen, fireEvent, act } from "@testing-library/react";
import FahrplanPage from "./page";

jest.mock("./api", () => ({
  fetchNearbyStation: jest.fn(),
  fetchCompletions: jest.fn(),
  fetchStationboard: jest.fn(),
}));

jest.mock("./useStation", () => ({
  useStation: jest.fn(() => ({ station: null, setStation: mockSetStation })),
}));

jest.mock("./StationSearch", () => ({
  StationSearch: () => <div data-testid="station-search" />,
}));

jest.mock("./DepartureBoard", () => ({
  DepartureBoard: () => <div data-testid="departure-board" />,
}));

jest.mock("@/components/ui/PageTitle", () => ({
  PageTitle: () => null,
}));

const { fetchNearbyStation } = jest.requireMock("./api") as {
  fetchNearbyStation: jest.Mock;
};

const mockSetStation = jest.fn();

let mockGetCurrentPosition: jest.Mock;
const originalGeolocation = navigator.geolocation;

beforeEach(() => {
  fetchNearbyStation.mockReset();
  mockSetStation.mockReset();
  mockGetCurrentPosition = jest.fn();
  Object.defineProperty(navigator, "geolocation", {
    value: { getCurrentPosition: mockGetCurrentPosition },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  Object.defineProperty(navigator, "geolocation", {
    value: originalGeolocation,
    writable: true,
    configurable: true,
  });
});

describe("FahrplanPage locate button", () => {
  it("renders locate button in search mode", () => {
    render(<FahrplanPage />);
    expect(screen.getByText("Use my location")).toBeInTheDocument();
  });

  it("selects nearest station on geolocation success", async () => {
    fetchNearbyStation.mockResolvedValue("Zürich HB");
    render(<FahrplanPage />);

    fireEvent.click(screen.getByText("Use my location"));

    const [onSuccess] = mockGetCurrentPosition.mock.calls[0];
    await act(() =>
      onSuccess({ coords: { latitude: 47.37, longitude: 8.54 } })
    );

    expect(fetchNearbyStation).toHaveBeenCalledWith(47.37, 8.54);
    expect(mockSetStation).toHaveBeenCalledWith("Zürich HB");
  });

  it("shows error when no stations found", async () => {
    fetchNearbyStation.mockResolvedValue(null);
    render(<FahrplanPage />);

    fireEvent.click(screen.getByText("Use my location"));

    const [onSuccess] = mockGetCurrentPosition.mock.calls[0];
    await act(() => onSuccess({ coords: { latitude: 0, longitude: 0 } }));

    expect(screen.getByText("No stations found nearby")).toBeInTheDocument();
  });

  it("shows error on permission denied", () => {
    render(<FahrplanPage />);

    fireEvent.click(screen.getByText("Use my location"));

    const [, onError] = mockGetCurrentPosition.mock.calls[0];
    act(() => onError({ code: 1, PERMISSION_DENIED: 1 }));

    expect(screen.getByText("Location access denied")).toBeInTheDocument();
  });

  it("shows generic error on other geolocation failure", () => {
    render(<FahrplanPage />);

    fireEvent.click(screen.getByText("Use my location"));

    const [, onError] = mockGetCurrentPosition.mock.calls[0];
    act(() => onError({ code: 2, PERMISSION_DENIED: 1 }));

    expect(screen.getByText("Could not get location")).toBeInTheDocument();
  });

  it("shows error when geolocation unsupported", () => {
    // "geolocation" in navigator must be false — delete it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (navigator as any).geolocation;

    render(<FahrplanPage />);
    fireEvent.click(screen.getByText("Use my location"));

    expect(screen.getByText("Geolocation not supported")).toBeInTheDocument();
  });

  it("disables button while locating", () => {
    render(<FahrplanPage />);

    const button = screen.getByText("Use my location").closest("button")!;
    expect(button).not.toBeDisabled();

    fireEvent.click(button);
    expect(screen.getByText("Locating…").closest("button")).toBeDisabled();
  });
});
