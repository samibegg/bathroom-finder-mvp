"use client";

import { useEffect, useRef } from "react";

export interface BathroomLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  type: string;
  isPublic: boolean;
  cleanlinessRating: number;
  distanceKm?: number;
}

interface Props {
  userLat: number;
  userLon: number;
  bathrooms: BathroomLocation[];
  onBoundsChange?: (bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number }) => void;
}

export default function BathroomMap({ userLat, userLon, bathrooms, onBoundsChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const onBoundsChangeRef = useRef(onBoundsChange);

  useEffect(() => {
    onBoundsChangeRef.current = onBoundsChange;
  }, [onBoundsChange]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (leafletMapRef.current) return;

    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!).setView([userLat, userLon], 15);
      leafletMapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const userIcon = L.divIcon({
        className: "",
        html: '<div class="w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([userLat, userLon], { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>You are here</b>");

      map.on("moveend", () => {
        if (onBoundsChangeRef.current) {
          const bounds = map.getBounds();
          onBoundsChangeRef.current({
            minLat: bounds.getSouth(),
            maxLat: bounds.getNorth(),
            minLon: bounds.getWest(),
            maxLon: bounds.getEast()
          });
        }
      });
    });

    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current) return;
    
    import("leaflet").then((L) => {
      const map = leafletMapRef.current;
      
      markersRef.current.forEach(m => map.removeLayer(m));
      markersRef.current = [];

      bathrooms.forEach((b) => {
        const ratingColor = b.cleanlinessRating >= 4 ? "bg-green-500" : b.cleanlinessRating >= 3 ? "bg-yellow-500" : "bg-red-500";
        const bathroomIcon = L.divIcon({
          className: "",
          html: `<div class="w-8 h-8 ${ratingColor} border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white text-xs font-bold">${b.cleanlinessRating.toFixed(1)}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        const distText = b.distanceKm != null ? ` · ${(b.distanceKm * 1000).toFixed(0)}m away` : "";
        const marker = L.marker([b.latitude, b.longitude], { icon: bathroomIcon })
          .addTo(map)
          .bindPopup(`<b>${b.name}</b><br/>${b.address}<br/>${b.type} · ${b.isPublic ? "Public" : "Customers only"}${distText}<br/><a href="/bathroom/${b.id}" class="text-indigo-600 underline font-medium mt-1 block">View Details & Codes</a>`);
        markersRef.current.push(marker);
      });
    });
  }, [bathrooms]);

  return <div ref={mapRef} className="w-full h-full rounded-t-2xl z-0" />;
}
