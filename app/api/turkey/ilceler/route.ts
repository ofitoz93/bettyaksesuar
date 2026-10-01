import { NextResponse, type NextRequest } from "next/server";
import { getDistrictsForCity } from "@/lib/data/turkeyAddress";

export async function GET(request: NextRequest) {
  const il = request.nextUrl.searchParams.get("il") ?? "";
  return NextResponse.json({ districts: getDistrictsForCity(il) });
}
