import type { Severity, Priority, Status } from "@/lib/schemas";
import { regionFromCoords } from "./eonet";
import { placeOrRegion } from "./place-label";
import type { SerializableOrbiEvent } from "./eonet";

/**
 * ORBI DATA CORE — USGS FDSN Event Adapter
 *
 * Docs: https://earthquake.usgs.gov/fdsnws/event/1/
 * Puro e isomórfico — sem fetch aqui.
 */
export const USGS_API = "https://earthquake.usgs.gov/fdsnws/event/1/query";

export type UsgsFeature = {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number | null;
    updated: number | null;
    url?: string | null;
    title?: string | null;
    type?: string | null;
    tsunami?: number | null;
  };
  geometry: { type: string; coordinates: number[] } | null;
};

export type UsgsResponse = { features?: UsgsFeature[] };

function severityFromMagnitude(mag: number | null): Severity {
  if (mag == null) return "unknown";
  if (mag >= 7) return "critical";
  if (mag >= 6) return "high";
  if (mag >= 4.5) return "moderate";
  return "low";
}

function severityToPriority(severity: Severity): Priority {
  if (severity === "critical") return "critical";
  if (severity === "high") return "high";
  if (severity === "moderate") return "normal";
  return "low";
}

export function usgsFeatureToOrbiEvent(feature: UsgsFeature): SerializableOrbiEvent | null {
  const coords = feature.geometry?.coordinates;
  if (!coords || typeof coords[0] !== "number" || typeof coords[1] !== "number") return null;

  const lng = coords[0];
  const lat = coords[1];
  const depthKm = typeof coords[2] === "number" ? coords[2] : null;
  const mag = feature.properties.mag ?? null;
  const severity = severityFromMagnitude(mag);
  const status: Status = "active";
  const time = feature.properties.time ?? Date.now();
  const updated = feature.properties.updated ?? time;
  const place = placeOrRegion(feature.properties.place, lat, lng);

  return {
    id: `usgs-${feature.id}`,
    externalId: feature.id,
    title: feature.properties.title ?? `M ${mag ?? "?"} — ${place}`,
    category: "geology",
    phenomenon: "earthquake",
    tags: ["earthquake", ...(feature.properties.tsunami ? ["tsunami"] : [])],
    location: {
      latitude: lat,
      longitude: lng,
      name: place,
      region: regionFromCoords(lat, lng),
      entityType: "area",
    },
    status,
    severity,
    priority: severityToPriority(severity),
    detectedAt: new Date(time).toISOString(),
    updatedAt: new Date(updated).toISOString(),
    source: {
      id: "usgs",
      name: "USGS",
      type: "geological",
      url: "https://earthquake.usgs.gov/",
      externalId: feature.id,
    },
    geometry: { type: "Point", coordinates: [lng, lat] },
    ...(feature.properties.url ? { sourceUrl: feature.properties.url } : {}),
    metadata: {
      magnitude: mag != null ? `M ${mag.toFixed(1)}` : "",
      depth: depthKm != null ? `${depthKm.toFixed(0)} km` : "",
    },
  };
}

export function usgsResponseToOrbiEvents(response: UsgsResponse): SerializableOrbiEvent[] {
  return (response.features ?? [])
    .map(usgsFeatureToOrbiEvent)
    .filter((e): e is SerializableOrbiEvent => e !== null)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}
