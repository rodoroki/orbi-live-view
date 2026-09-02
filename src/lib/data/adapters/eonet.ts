import type { OrbiEvent, Priority, Severity, Status } from "@/lib/schemas";
import type { OrbiRegion } from "@/lib/orbi-events";

/**
 * ORBI DATA CORE — NASA EONET v3 Adapter
 *
 * Docs: https://eonet.gsfc.nasa.gov/docs/v3
 * Converte a resposta do EONET (Earth Observatory Natural Event Tracker)
 * para o modelo canônico OrbiEvent. Puro e isomórfico — sem fetch aqui.
 */

export const EONET_API = "https://eonet.gsfc.nasa.gov/api/v3/events";

export type EonetGeometry = {
  date: string;
  type: string;
  coordinates: unknown;
  magnitudeValue?: number | null;
  magnitudeUnit?: string | null;
};

export type EonetEvent = {
  id: string;
  title: string;
  description?: string | null;
  link?: string;
  closed?: string | null;
  categories: { id: string; title: string }[];
  sources?: { id: string; url: string }[];
  geometry: EonetGeometry[];
};

export type EonetResponse = { events: EonetEvent[] };

/** categoria EONET -> { category, phenomenon } na taxonomia ORBI */
const EONET_CATEGORY_MAP: Record<string, { category: string; phenomenon: string }> = {
  wildfires: { category: "fire", phenomenon: "wildfire" },
  volcanoes: { category: "geology", phenomenon: "volcanic-eruption" },
  earthquakes: { category: "geology", phenomenon: "earthquake" },
  landslides: { category: "geology", phenomenon: "landslide" },
  severeStorms: { category: "weather", phenomenon: "storm" },
  floods: { category: "weather", phenomenon: "flood" },
  snow: { category: "weather", phenomenon: "precipitation" },
  drought: { category: "climate", phenomenon: "climate-event" },
  tempExtremes: { category: "climate", phenomenon: "temperature" },
  dustHaze: { category: "atmosphere", phenomenon: "dust-storm" },
  manmade: { category: "atmosphere", phenomenon: "severe-weather" },
  seaLakeIce: { category: "ocean", phenomenon: "sea-surface-temperature" },
  waterColor: { category: "ocean", phenomenon: "ocean-current" },
};

/** Sub-tipo de tempestade a partir do título (EONET usa nomes próprios). */
function refineStorm(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("hurricane")) return "hurricane";
  if (t.includes("typhoon")) return "typhoon";
  if (t.includes("cyclone")) return "cyclone";
  if (t.includes("tropical storm") || t.includes("tropical depression")) return "tropical-storm";
  return "storm";
}

/** Último ponto conhecido do evento (EONET fornece trajetórias). */
function latestPoint(geometry: EonetGeometry[]): {
  lat: number;
  lng: number;
  date: string;
  magnitudeValue?: number | null;
  magnitudeUnit?: string | null;
} | null {
  const sorted = [...geometry].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  for (let i = sorted.length - 1; i >= 0; i--) {
    const g = sorted[i]!;
    const coords = flattenToPoint(g.coordinates);
    if (!coords) continue;
    return {
      lng: coords[0],
      lat: coords[1],
      date: g.date,
      magnitudeValue: g.magnitudeValue ?? null,
      magnitudeUnit: g.magnitudeUnit ?? null,
    };
  }
  return null;
}

/** Point → [lng, lat]; Polygon → centróide simples do primeiro anel. */
function flattenToPoint(coordinates: unknown): [number, number] | null {
  if (Array.isArray(coordinates) && typeof coordinates[0] === "number" && typeof coordinates[1] === "number") {
    return [coordinates[0], coordinates[1]];
  }
  const points: [number, number][] = [];
  const walk = (node: unknown) => {
    if (!Array.isArray(node)) return;
    if (typeof node[0] === "number" && typeof node[1] === "number") {
      points.push([node[0], node[1]]);
      return;
    }
    node.forEach(walk);
  };
  walk(coordinates);
  if (points.length === 0) return null;
  const sum = points.reduce<[number, number]>(
    (acc, p) => [acc[0] + p[0], acc[1] + p[1]],
    [0, 0],
  );
  return [sum[0] / points.length, sum[1] / points.length];
}

/** Bucket continental aproximado por coordenadas (o EONET não traz país). */
export function regionFromCoords(lat: number, lng: number): OrbiRegion {
  const inBox = (latMin: number, latMax: number, lngMin: number, lngMax: number) =>
    lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax;

  if (inBox(-56, 72, -170, -30)) return "americas";
  if (inBox(35, 72, -25, 45)) return "europe";
  if (inBox(-35, 37, -20, 52)) return "africa";
  if (inBox(-11, 78, 52, 180)) return "asia";
  if (inBox(-50, -11, 110, 180)) return "oceania";
  return "oceans";
}

/** Severidade heurística: sem escala unificada no EONET, usamos magnitude/idade. */
function inferSeverity(categoryId: string, magnitude: number | null | undefined): Severity {
  if (typeof magnitude === "number") {
    if (categoryId === "severeStorms") {
      if (magnitude >= 96) return "critical";
      if (magnitude >= 64) return "high";
      if (magnitude >= 34) return "moderate";
      return "low";
    }
    if (categoryId === "wildfires") {
      if (magnitude >= 100_000) return "critical";
      if (magnitude >= 10_000) return "high";
      return "moderate";
    }
  }
  if (categoryId === "volcanoes" || categoryId === "earthquakes") return "high";
  if (categoryId === "wildfires" || categoryId === "severeStorms") return "moderate";
  return "low";
}

function severityToPriority(severity: Severity): Priority {
  if (severity === "critical") return "critical";
  if (severity === "high") return "high";
  if (severity === "moderate") return "normal";
  return "low";
}

function formatMagnitude(value?: number | null, unit?: string | null): string {
  if (typeof value !== "number") return "";
  return unit ? `${value} ${unit}` : String(value);
}

function placeName(title: string, lat: number, lng: number): string {
  const parts = title.split(",");
  if (parts.length > 1) return parts.slice(1).join(",").trim();
  return `${lat.toFixed(1)}°, ${lng.toFixed(1)}°`;
}

export function eonetEventToOrbiEvent(event: EonetEvent): OrbiEvent | null {
  const point = latestPoint(event.geometry ?? []);
  if (!point) return null;

  const eonetCategory = event.categories?.[0]?.id ?? "manmade";
  const mapping = EONET_CATEGORY_MAP[eonetCategory] ?? {
    category: "natural-events",
    phenomenon: "severe-weather",
  };
  const phenomenon =
    eonetCategory === "severeStorms" ? refineStorm(event.title) : mapping.phenomenon;

  const severity = inferSeverity(eonetCategory, point.magnitudeValue);
  const status: Status = event.closed ? "ended" : "active";
  const detectedAt = new Date(event.geometry[0]?.date ?? point.date).toISOString();

  return {
    id: `eonet-${event.id}`,
    externalId: event.id,
    title: event.title,
    ...(event.description ? { description: event.description } : {}),
    category: mapping.category,
    phenomenon,
    tags: [eonetCategory, ...(severity === "critical" ? ["extreme"] : [])],
    location: {
      latitude: point.lat,
      longitude: point.lng,
      name: placeName(event.title, point.lat, point.lng),
      region: regionFromCoords(point.lat, point.lng),
      entityType: "area",
    },
    status,
    severity,
    priority: severityToPriority(severity),
    detectedAt,
    updatedAt: new Date(point.date).toISOString(),
    source: {
      id: "nasa-eonet",
      name: "NASA EONET",
      type: "space-agency",
      url: "https://eonet.gsfc.nasa.gov/",
      externalId: event.id,
    },
    geometry: { type: "Point", coordinates: [point.lng, point.lat] },
    ...(event.link ? { sourceUrl: event.link } : {}),
    metadata: {
      magnitude: formatMagnitude(point.magnitudeValue, point.magnitudeUnit),
      eonetCategory,
    },
  };
}

export function eonetResponseToOrbiEvents(response: EonetResponse): OrbiEvent[] {
  return (response.events ?? [])
    .map(eonetEventToOrbiEvent)
    .filter((e): e is OrbiEvent => e !== null)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}
