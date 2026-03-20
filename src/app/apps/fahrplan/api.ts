import type { CompletionItem, StationboardResponse } from "./types";

export async function fetchCompletions(
  term: string
): Promise<CompletionItem[]> {
  const res = await fetch(
    `/api/fahrplan/completion?term=${encodeURIComponent(term)}`
  );
  if (!res.ok) return [];
  return res.json();
}

export async function fetchStationboard(
  stop: string,
  limit = 50
): Promise<StationboardResponse> {
  const res = await fetch(
    `/api/fahrplan/stationboard?stop=${encodeURIComponent(stop)}&limit=${limit}`
  );
  if (!res.ok)
    return {
      stop: { id: "", name: stop, type: "", lon: 0, lat: 0 },
      connections: [],
    };
  return res.json();
}
