"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

interface MapEvent {
  event_id: string;
  date: string;
  attacker: string;
  attack_type: string;
  target_category: string;
  location: { name: string; lat: number; lon: number; governorate: string; accuracy: string };
  casualties: { killed_total: number; wounded_total: number };
  ihl_classification: string;
  description?: string;
  source_urls: string[];
}

interface Props {
  events: MapEvent[];
}

const ATTACKER_COLORS: Record<string, string> = {
  IDF: "#ef4444",
  Hezbollah: "#eab308",
  IRGC: "#f97316",
  LAF: "#22c55e",
  Unknown: "#888888",
};

const TARGET_RADIUS: Record<string, number> = {
  civilian_residential: 12,
  medical_facility: 14,
  ambulance: 14,
  journalist: 13,
  infrastructure_water: 10,
  infrastructure_power: 10,
  military_idf: 8,
  military_hezbollah: 8,
  civilian_vehicle: 9,
  cultural_heritage: 11,
};

export function AttackMap({ events }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [33.85, 35.5],
      zoom: 8,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    const blueLineCoords: [number, number][] = [
      [33.09, 35.1], [33.1, 35.2], [33.11, 35.3], [33.12, 35.4],
      [33.13, 35.5], [33.15, 35.6], [33.28, 35.77],
    ];
    L.polyline(blueLineCoords, {
      color: "#3b82f6",
      weight: 2,
      dashArray: "8 4",
      opacity: 0.7,
    }).addTo(map).bindPopup("<b>Blue Line</b><br>UN-demarcated withdrawal line");

    const litaniCoords: [number, number][] = [
      [33.35, 35.2], [33.37, 35.3], [33.36, 35.4], [33.34, 35.5],
      [33.33, 35.55], [33.32, 35.6], [33.3, 35.65],
    ];
    L.polyline(litaniCoords, {
      color: "#06b6d4",
      weight: 2,
      dashArray: "4 4",
      opacity: 0.5,
    }).addTo(map).bindPopup("<b>Litani River</b><br>Strategic water resource / Israeli territorial ambition line");

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker) map.removeLayer(layer);
    });

    events.forEach((evt) => {
      const color = ATTACKER_COLORS[evt.attacker] || "#888";
      const radius = TARGET_RADIUS[evt.target_category] || 8;
      const casualtyMultiplier = Math.min(2, 1 + (evt.casualties.killed_total / 20));

      const marker = L.circleMarker([evt.location.lat, evt.location.lon], {
        radius: radius * casualtyMultiplier,
        color: color,
        fillColor: color,
        fillOpacity: 0.6,
        weight: evt.ihl_classification === "confirmed_violation" ? 3 : 1,
        className: evt.ihl_classification === "confirmed_violation" ? "pulse-marker" : "",
      }).addTo(map);

      const popupContent = `
        <div style="font-family: monospace; font-size: 11px; max-width: 280px; color: #e8e8f0; background: rgba(10,10,30,0.95); padding: 12px; border-radius: 8px;">
          <div style="color: #00f5ff; font-size: 10px; margin-bottom: 4px;">${evt.date} | ${evt.event_id}</div>
          <div style="font-weight: bold; margin-bottom: 6px;">${evt.location.name}</div>
          <div style="margin-bottom: 4px;">
            <span style="color: ${color};">■</span> ${evt.attacker} → ${evt.target_category.replace(/_/g, " ")}
          </div>
          <div style="margin-bottom: 4px;">Type: ${evt.attack_type.replace(/_/g, " ")}</div>
          ${evt.description ? `<div style="color: #aaa; margin-bottom: 4px;">${evt.description}</div>` : ""}
          <div style="color: #ef4444;">Killed: ${evt.casualties.killed_total} | Wounded: ${evt.casualties.wounded_total}</div>
          <div style="margin-top: 4px; color: ${evt.ihl_classification.includes("violation") ? "#ef4444" : "#888"};">
            IHL: ${evt.ihl_classification.replace(/_/g, " ")}
          </div>
          ${evt.location.accuracy !== "exact" ? `<div style="color: #666; font-size: 9px; margin-top: 4px;">Location accuracy: ${evt.location.accuracy}</div>` : ""}
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "dark-popup",
        maxWidth: 300,
      });
    });
  }, [events]);

  return <div ref={mapRef} className="h-[600px] w-full rounded-xl" />;
}
