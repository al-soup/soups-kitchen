import { NextRequest, NextResponse } from "next/server";
import { STATIONBOARD_POLL_INTERVAL_S } from "@/app/apps/fahrplan/constants";

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 30;

function parseLimit(raw: string | null): number {
  const n = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(n, MAX_LIMIT);
}

export async function GET(req: NextRequest) {
  const stop = req.nextUrl.searchParams.get("stop") ?? "";
  if (!stop) return NextResponse.json({ connections: [] });
  const limit = parseLimit(req.nextUrl.searchParams.get("limit"));

  const url = `https://search.ch/fahrplan/api/stationboard.json?stop=${
    encodeURIComponent(stop)
  }&limit=${limit}&mode=depart`;
  try {
    // Cache TTL matches the client poll interval — multiple tabs/users
    // hitting the same stop within one tick share an upstream call, but a
    // single user never sees data older than their own next poll. Anything
    // longer would lag real-time delay/cancel info.
    const res = await fetch(url, {
      next: { revalidate: STATIONBOARD_POLL_INTERVAL_S },
    });
    if (!res.ok) {
      return NextResponse.json(
        { connections: [], error: "upstream_error" },
        { status: 502 },
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { connections: [], error: "upstream_unreachable" },
      { status: 502 },
    );
  }
}
