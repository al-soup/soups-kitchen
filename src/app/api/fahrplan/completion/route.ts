import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const term = req.nextUrl.searchParams.get("term") ?? "";
  const latlon = req.nextUrl.searchParams.get("latlon") ?? "";
  const accuracy = req.nextUrl.searchParams.get("accuracy") ?? "";

  if (!term && !latlon) return NextResponse.json([]);

  const params = new URLSearchParams();
  if (term) params.set("term", term);
  if (latlon) params.set("latlon", latlon);
  if (accuracy) params.set("accuracy", accuracy);

  const url = `https://search.ch/fahrplan/api/completion.json?${params}`;
  try {
    // Cache upstream requests for a particular station at search.ch
    // for 1h since station data is not likely to change often.
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json([], { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 502 });
  }
}
