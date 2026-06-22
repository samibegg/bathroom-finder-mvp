import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lon = parseFloat(searchParams.get("lon") ?? "");
  const minLat = parseFloat(searchParams.get("minLat") ?? "");
  const maxLat = parseFloat(searchParams.get("maxLat") ?? "");
  const minLon = parseFloat(searchParams.get("minLon") ?? "");
  const maxLon = parseFloat(searchParams.get("maxLon") ?? "");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  let query: any = {};

  if (!isNaN(minLat) && !isNaN(maxLat) && !isNaN(minLon) && !isNaN(maxLon)) {
    query = {
      where: {
        latitude: { gte: minLat, lte: maxLat },
        longitude: { gte: minLon, lte: maxLon }
      },
      take: limit
    };
  }

  const bathrooms = await prisma.bathroom.findMany(query);

  if (!isNaN(lat) && !isNaN(lon)) {
    const sorted = bathrooms
      .map((b) => ({ ...b, distanceKm: haversine(lat, lon, b.latitude, b.longitude) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit);
    return NextResponse.json(sorted);
  }

  return NextResponse.json(bathrooms.slice(0, limit));
}
