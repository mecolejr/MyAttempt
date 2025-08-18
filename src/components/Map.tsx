"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type MapProps = {
  center?: [number, number];
  zoom?: number;
  styleUrl?: string;
  markers?: Array<{ lon: number; lat: number; label?: string; color?: string }>;
};

export default function Map({
  center = [-98.5795, 39.8283],
  zoom = 3.5,
  styleUrl = "https://demotiles.maplibre.org/style.json",
  markers = [],
}: MapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center,
      zoom,
      attributionControl: true,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center, zoom, styleUrl]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    (map as any)._trueplaceMarkers?.forEach((m: maplibregl.Marker) => m.remove());

    const created: maplibregl.Marker[] = markers.map((m) => {
      const marker = new maplibregl.Marker({ color: m.color || "#2563eb" })
        .setLngLat([m.lon, m.lat]);
      if (m.label) marker.setPopup(new maplibregl.Popup({ offset: 12 }).setText(m.label));
      marker.addTo(map);
      return marker;
    });
    (map as any)._trueplaceMarkers = created;
  }, [markers]);

  return <div ref={containerRef} className="w-full h-full" />;
}


