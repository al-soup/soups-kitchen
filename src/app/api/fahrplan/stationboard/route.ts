import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const stop = req.nextUrl.searchParams.get("stop") ?? "";
  const limit = req.nextUrl.searchParams.get("limit") ?? "30";
  if (!stop) return NextResponse.json({ connections: [] });

  const url = `https://search.ch/fahrplan/api/stationboard.json?stop=${encodeURIComponent(stop)}&limit=${encodeURIComponent(limit)}&mode=depart`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  const data = await res.json();
  return NextResponse.json(data);
}
