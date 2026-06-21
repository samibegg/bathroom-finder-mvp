"use client";

import { BathroomLocation } from "./BathroomMap";

interface Props {
  bathrooms: BathroomLocation[];
}

const typeEmoji: Record<string, string> = {
  Park: "🌳",
  Hotel: "🏨",
  Cafe: "☕",
  Transit: "🚆",
  Library: "📚",
};

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="text-yellow-400 text-sm">
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(Math.max(0, 5 - full - (half ? 1 : 0)))}
      <span className="text-gray-500 ml-1 text-xs">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function BottomSheet({ bathrooms }: Props) {
  return (
    <div className="bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 flex flex-col">
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </div>
      <div className="px-4 pb-2">
        <h2 className="text-base font-semibold text-gray-800">Nearby Restrooms</h2>
        <p className="text-xs text-gray-500">{bathrooms.length} found near you</p>
      </div>
      <div className="overflow-y-auto flex-1 divide-y divide-gray-100 pb-safe">
        {bathrooms.map((b, i) => (
          <div key={b.id} className="px-4 py-3 flex gap-3 items-start active:bg-gray-50">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-lg">
              {typeEmoji[b.type] ?? "🚻"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-sm text-gray-900 leading-tight truncate">{b.name}</p>
                {i === 0 && (
                  <span className="flex-shrink-0 text-xs bg-green-100 text-green-700 font-medium px-1.5 py-0.5 rounded">
                    Closest
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{b.address}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <StarRating rating={b.cleanlinessRating} />
                <span className="text-xs text-gray-400">·</span>
                <span
                  className={`text-xs font-medium ${b.isPublic ? "text-green-600" : "text-orange-500"}`}
                >
                  {b.isPublic ? "Public" : "Customers only"}
                </span>
                {b.distanceKm != null && (
                  <>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">
                      {b.distanceKm < 1
                        ? `${(b.distanceKm * 1000).toFixed(0)}m`
                        : `${b.distanceKm.toFixed(1)}km`}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
