import { NextResponse, type NextRequest } from "next/server";
import { getNeighbourhoodsForDistrict } from "@/lib/data/turkeyAddress";

export async function GET(request: NextRequest) {
  const il = request.nextUrl.searchParams.get("il") ?? "";
  const ilce = request.nextUrl.searchParams.get("ilce") ?? "";
  return NextResponse.json({ neighbourhoods: getNeighbourhoodsForDistrict(il, ilce) });
}
