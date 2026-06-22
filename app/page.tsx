"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import BottomSheet from "@/components/BottomSheet";
import type { BathroomLocation } from "@/components/BathroomMap";

// Leaflet must be client-only
const BathroomMap = dynamic(() => import("@/components/BathroomMap"), { ssr: false });

type Status = "idle" | "requesting" | "loading" | "ready" | "error";

export default function HomePage() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [bathrooms, setBathrooms] = useState<BathroomLocation[]>([]);

  const fetchNearby = useCallback(async (lat: number, lon: number) => {
    setStatus("loading");
    try {
      const res = await fetch(`/api/bathrooms?lat=${lat}&lon=${lon}&limit=10`);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setBathrooms(data);
      setStatus("ready");
    } catch {
      setErrorMsg("Failed to load bathrooms. Please try again.");
      setStatus("error");
    }
  }, []);

  const handleFindMe = useCallback(() => {
    if (!navigator.geolocation) {
      setErrorMsg("Your browser doesn't support geolocation.");
      setStatus("error");
      return;
    }
    setStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLat(latitude);
        setUserLon(longitude);
        fetchNearby(latitude, longitude);
      },
      (err) => {
        setErrorMsg(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Please enable location access and try again."
            : "Unable to determine your location."
        );
        setStatus("error");
      },
      { timeout: 10000 }
    );
  }, [fetchNearby]);

  // Auto-request location on mount
  useEffect(() => {
    handleFindMe();
  }, [handleFindMe]);

  return (
    <main className="relative flex flex-col h-dvh bg-gray-100 overflow-hidden">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚽</span>
          <span className="font-bold text-gray-900 text-lg leading-tight">
            Gotta<span className="text-indigo-600">Flush</span>
          </span>
        </div>
        <button
          onClick={handleFindMe}
          className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-full font-medium active:bg-indigo-700 transition-colors"
        >
          Refresh
        </button>
      </header>

      {/* Map area */}
      <div className="flex-1 pt-[60px]">
        {status === "ready" && userLat !== null && userLon !== null ? (
          <BathroomMap
            userLat={userLat}
            userLon={userLon}
            bathrooms={bathrooms}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-4 px-6 text-center">
            {status === "idle" && (
              <>
                <div className="text-6xl">🚽</div>
                <h1 className="text-2xl font-bold text-gray-900">Find a Clean Restroom</h1>
                <p className="text-gray-500 text-sm max-w-xs">
                  Instantly find the nearest public bathrooms with GottaFlush, with cleanliness ratings.
                </p>
                <button
                  onClick={handleFindMe}
                  className="mt-2 bg-indigo-600 text-white font-semibold px-8 py-3.5 rounded-2xl text-base shadow-lg active:bg-indigo-700 transition-colors"
                >
                  📍 Find Near Me
                </button>
              </>
            )}
            {(status === "requesting" || status === "loading") && (
              <>
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-600 text-sm font-medium">
                  {status === "requesting" ? "Getting your location…" : "Finding nearby restrooms…"}
                </p>
              </>
            )}
            {status === "error" && (
              <>
                <div className="text-5xl">😕</div>
                <p className="text-gray-700 font-medium">{errorMsg}</p>
                <button
                  onClick={handleFindMe}
                  className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-2xl shadow active:bg-indigo-700 transition-colors"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom sheet */}
      {status === "ready" && bathrooms.length > 0 && (
        <div className="relative z-10 max-h-[45vh] flex flex-col">
          <BottomSheet bathrooms={bathrooms.slice(0, 3)} />
        </div>
      )}
    </main>
  );
}
