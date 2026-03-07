import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const term = req.nextUrl.searchParams.get("term") ?? "";
  if (!term) return NextResponse.json([]);

  const url = `https://search.ch/fahrplan/api/completion.json?term=${encodeURIComponent(term)}`;
  const res = await fetch(url);
  const data = await res.json();
  return NextResponse.json(data);
}
