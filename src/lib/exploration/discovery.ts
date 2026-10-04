import { SEVERITY_META, type EventCategory, type OrbiEvent } from "@/lib/orbi-events";
import { distanceKm } from "@/lib/intelligence/relevance";

/**
 * ORBI Exploration Engine — domínio de descoberta.
 * Uma Discovery é sempre derivada de dados reais já carregados.
 * Tipos sem fonte conectada existem apenas como contrato futuro.
 */
export type DiscoveryType =
  | "earthquake"
  | "event"
  | "camera"
  | "aircraft"
  | "weather"
  | "ocean"
  | "satellite"
  | "fire"
  | "space";

/** Tipos com fonte real conectada hoje. Os demais permanecem indisponíveis. */
export const AVAILABLE_DISCOVERY_TYPES: DiscoveryType[] = [
  "earthquake",
  "event",
  "fire",
  "ocean",
  "camera",
  "weather",
];

export type DiscoveryAction = "focus" | "nearby" | "cameras" | "weather" | "history" | "follow";

export type Discovery = {
  id: string;
  type: DiscoveryType;
  title: string;
  place: string;
  coordinates: { lat: number; lng: number };
  /** minutos desde a detecção declarada pela fonte */
  minutesAgo: number;
  relevance: number;
  availableActions: DiscoveryAction[];
  historicalAvailability: boolean;
  followable: boolean;
  event: OrbiEvent;
};

export const NEARBY_RADIUS_KM = 1500;
/** Janela histórica real exposta pela timeline (horas). */
export const HISTORY_WINDOW_HOURS = 48;

const TYPE_BY_CATEGORY: Record<EventCategory, DiscoveryType> = {
  quake: "earthquake",
  fire: "fire",
  ocean: "ocean",
  storm: "event",
  volcano: "event",
  atmosphere: "event",
};

/** Hora da timeline imediatamente anterior à detecção, ou null fora da janela real. */
export function historyHourFor(event: OrbiEvent): number | null {
  const hours = Math.ceil(event.detectedMinutesAgo / 60) + 1;
  return hours <= HISTORY_WINDOW_HOURS ? -hours : null;
}

export function relevanceOf(event: OrbiEvent): number {
  const severity = (SEVERITY_META[event.severity]?.rank ?? 1) / 4;
  const freshness = 1 / (1 + event.detectedMinutesAgo / 360);
  return Math.round((severity * 0.6 + freshness * 0.4) * 1000) / 1000;
}

export function toDiscovery(event: OrbiEvent, events: OrbiEvent[] = []): Discovery {
  const historicalAvailability = historyHourFor(event) !== null;
  const hasNearby = getNearbyDiscoveries(event, events).length > 0;
  const actions: DiscoveryAction[] = ["focus", "cameras", "weather", "follow"];
  if (hasNearby) actions.push("nearby");
  if (historicalAvailability) actions.push("history");
  return {
    id: event.id,
    type: TYPE_BY_CATEGORY[event.category] ?? "event",
    title: event.title,
    place: event.place,
    coordinates: { lat: event.lat, lng: event.lng },
    minutesAgo: event.detectedMinutesAgo,
    relevance: relevanceOf(event),
    availableActions: actions,
    historicalAvailability,
    followable: true,
    event,
  };
}

export type NearbyItem = { event: OrbiEvent; distanceKm: number };

export function getNearbyDiscoveries(
  target: { id?: string; lat: number; lng: number },
  events: OrbiEvent[],
  { radiusKm = NEARBY_RADIUS_KM, limit = 3 }: { radiusKm?: number; limit?: number } = {},
): NearbyItem[] {
  return events
    .filter((e) => e.id !== target.id)
    .map((event) => ({ event, distanceKm: Math.round(distanceKm(target, event)) }))
    .filter((item) => item.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

export type NextDiscovery = { event: OrbiEvent; reason: "nearby" | "elsewhere" };

/** Proximidade, relevância, frescor, diversidade e sem repetir o que já foi visto. */
export function getNextDiscovery(
  current: OrbiEvent,
  events: OrbiEvent[],
  visited: string[] = [],
): NextDiscovery | null {
  const seen = new Set([...visited, current.id]);
  const pool = events.filter((e) => !seen.has(e.id));
  if (pool.length === 0) return null;
  let best: { event: OrbiEvent; score: number; d: number } | null = null;
  for (const event of pool) {
    const d = distanceKm(current, event);
    const proximity = Math.max(0, 1 - d / 5000);
    const diversity = event.category !== current.category ? 0.25 : 0;
    const score = proximity * 1.2 + relevanceOf(event) + diversity;
    if (!best || score > best.score || (score === best.score && event.id < best.event.id))
      best = { event, score, d };
  }
  if (!best) return null;
  return { event: best.event, reason: best.d <= NEARBY_RADIUS_KM ? "nearby" : "elsewhere" };
}

/** DESCOBRIR: um evento real atual, priorizando relevância e frescor, evitando repetição. */
export function pickDiscovery(events: OrbiEvent[], seen: string[] = []): OrbiEvent | null {
  if (events.length === 0) return null;
  const seenSet = new Set(seen);
  const fresh = events.filter((e) => !seenSet.has(e.id));
  const pool = fresh.length > 0 ? fresh : events;
  const recentCategories = new Set(
    seen
      .slice(-2)
      .map((id) => events.find((e) => e.id === id)?.category)
      .filter(Boolean),
  );
  return [...pool].sort((a, b) => {
    const sa = relevanceOf(a) + (recentCategories.has(a.category) ? 0 : 0.2);
    const sb = relevanceOf(b) + (recentCategories.has(b.category) ? 0 : 0.2);
    return sb - sa || a.id.localeCompare(b.id);
  })[0]!;
}
