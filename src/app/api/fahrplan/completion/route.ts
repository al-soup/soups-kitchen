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
  const res = await fetch(url);
  const data = await res.json();
  return NextResponse.json(data);
}
