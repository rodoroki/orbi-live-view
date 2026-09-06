import type { Severity, Priority, Status } from "@/lib/schemas";
import { regionFromCoords } from "./eonet";
import type { SerializableOrbiEvent } from "./eonet";

/**
 * ORBI DATA CORE — NOAA / National Weather Service Adapter
 *
 * Docs: https://api.weather.gov/ (alertas ativos)
 * Puro e isomórfico — sem fetch aqui.
 */
export const NWS_API = "https://api.weather.gov";

export type NwsAlertFeature = {
  id: string;
  properties: {
    event?: string | null;
    headline?: string | null;
    description?: string | null;
    areaDesc?: string | null;
    severity?: string | null;
    effective?: string | null;
    sent?: string | null;
    onset?: string | null;
    ends?: string | null;
    "@id"?: string | null;
  };
  geometry: { type: string; coordinates: unknown } | null;
};

export type NwsAlertsResponse = { features?: NwsAlertFeature[] };

const SEVERITY_MAP: Record<string, Severity> = {
  Extreme: "critical",
  Severe: "high",
  Moderate: "moderate",
  Minor: "low",
  Unknown: "unknown",
};

const PHENOMENON_BY_KEYWORD: { match: RegExp; category: string; phenomenon: string }[] = [
  { match: /flood/i, category: "weather", phenomenon: "flood" },
  { match: /tornado|thunderstorm|storm|wind|hurricane|tropical/i, category: "weather", phenomenon: "storm" },
  { match: /fire|smoke/i, category: "fire", phenomenon: "wildfire" },
  { match: /snow|ice|winter|blizzard|freez/i, category: "weather", phenomenon: "precipitation" },
  { match: /heat|cold|frost/i, category: "climate", phenomenon: "temperature" },
  { match: /dust/i, category: "atmosphere", phenomenon: "dust-storm" },
  { match: /surf|rip current|marine|tsunami|coastal/i, category: "ocean", phenomenon: "wave" },
];

function severityToPriority(severity: Severity): Priority {
  if (severity === "critical") return "critical";
  if (severity === "high") return "high";
  if (severity === "moderate") return "normal";
  return "low";
}

/** Centróide simples de qualquer geometria GeoJSON aninhada. */
function centroid(coordinates: unknown): [number, number] | null {
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
  const sum = points.reduce<[number, number]>((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
  return [sum[0] / points.length, sum[1] / points.length];
}

export function nwsAlertToOrbiEvent(feature: NwsAlertFeature): SerializableOrbiEvent | null {
  const point = centroid(feature.geometry?.coordinates);
  if (!point) return null;

  const [lng, lat] = point;
  const label = feature.properties.event ?? "Weather alert";
  const mapping =
    PHENOMENON_BY_KEYWORD.find((m) => m.match.test(label)) ??
    ({ category: "weather", phenomenon: "severe-weather" } as const);
  const severity = SEVERITY_MAP[feature.properties.severity ?? "Unknown"] ?? "unknown";
  const detectedAt = new Date(
    feature.properties.onset ?? feature.properties.effective ?? feature.properties.sent ?? Date.now(),
  ).toISOString();
  const ends = feature.properties.ends ? new Date(feature.properties.ends) : null;
  const status: Status = ends && ends.getTime() < Date.now() ? "ended" : "active";

  return {
    id: `nws-${feature.id}`,
    externalId: feature.id,
    title: feature.properties.headline ?? label,
    ...(feature.properties.description
      ? { description: feature.properties.description.slice(0, 600) }
      : {}),
    category: mapping.category,
    phenomenon: mapping.phenomenon,
    tags: ["alert", label.toLowerCase().replace(/\s+/g, "-")],
    location: {
      latitude: lat,
      longitude: lng,
      name: feature.properties.areaDesc ?? `${lat.toFixed(1)}°, ${lng.toFixed(1)}°`,
      region: regionFromCoords(lat, lng),
      country: "United States",
      entityType: "area",
    },
    status,
    severity,
    priority: severityToPriority(severity),
    detectedAt,
    updatedAt: new Date(feature.properties.sent ?? detectedAt).toISOString(),
    source: {
      id: "noaa-nws",
      name: "NOAA · National Weather Service",
      type: "meteorological",
      url: "https://www.weather.gov/",
      externalId: feature.id,
    },
    geometry: { type: "Point", coordinates: [lng, lat] },
    ...(feature.properties["@id"] ? { sourceUrl: feature.properties["@id"] } : {}),
    metadata: { magnitude: label, alertSeverity: feature.properties.severity ?? "" },
  };
}

export function nwsAlertsToOrbiEvents(response: NwsAlertsResponse): SerializableOrbiEvent[] {
  return (response.features ?? [])
    .map(nwsAlertToOrbiEvent)
    .filter((e): e is SerializableOrbiEvent => e !== null)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}
