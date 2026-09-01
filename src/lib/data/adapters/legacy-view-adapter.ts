import type { OrbiEvent } from "@/lib/schemas";
import type {
  OrbiEvent as LegacyEvent,
  EventCategory as LegacyCategory,
  EventSeverity as LegacySeverity,
  OrbiRegion as LegacyRegion,
} from "@/lib/orbi-events";

/**
 * ORBI DATA CORE — Legacy View Adapter
 *
 * Converte OrbiEvent (modelo canônico) de volta ao formato consumido
 * hoje por GlobeView, EventsPanel, MapControls e FlatMapView — sem
 * alterar nenhum desses componentes. Ver ponto 6:
 *
 *   dados fictícios atuais → novo OrbiEvent → interface atual
 *
 * Quando o EONET (ou outra fonte real) entrar em produção, o mesmo
 * adapter reutiliza este arquivo — ele não sabe nem precisa saber de
 * onde o OrbiEvent veio.
 */

const LEGACY_CATEGORIES: readonly LegacyCategory[] = [
  "fire",
  "storm",
  "volcano",
  "quake",
  "ocean",
  "atmosphere",
];

const LEGACY_REGIONS: readonly LegacyRegion[] = [
  "americas",
  "europe",
  "africa",
  "asia",
  "oceania",
  "oceans",
];

// phenomenon canônico -> category legada. Cobre os fenômenos que o
// mock adapter atualmente emite; fenômenos desconhecidos caem no
// fallback por category (ver CATEGORY_FALLBACK).
const PHENOMENON_TO_LEGACY: Record<string, LegacyCategory> = {
  wildfire: "fire",
  "volcanic-eruption": "volcano",
  earthquake: "quake",
  storm: "storm",
  cyclone: "storm",
  hurricane: "storm",
  "tropical-storm": "storm",
  typhoon: "storm",
  "severe-weather": "storm",
  "sea-surface-temperature": "ocean",
  swell: "ocean",
  "ocean-current": "ocean",
  wave: "ocean",
  "dust-storm": "atmosphere",
};

// Fallback grosseiro por category canônica, para fenômenos ainda não
// mapeados acima (relevante quando fontes reais trouxerem fenômenos
// novos). Aproximação temporária — revisitar quando a UI passar a
// consumir a taxonomia canônica diretamente, sem essa ponte.
const CATEGORY_FALLBACK: Record<string, LegacyCategory> = {
  fire: "fire",
  geology: "quake",
  weather: "storm",
  atmosphere: "atmosphere",
  ocean: "ocean",
  climate: "atmosphere",
  "natural-events": "fire",
};

function toLegacyCategory(event: OrbiEvent): LegacyCategory {
  return (
    PHENOMENON_TO_LEGACY[event.phenomenon] ??
    CATEGORY_FALLBACK[event.category] ??
    "atmosphere"
  );
}

function isLegacyRegion(value: string | undefined): value is LegacyRegion {
  return !!value && (LEGACY_REGIONS as readonly string[]).includes(value);
}

function toLegacyRegion(event: OrbiEvent): LegacyRegion {
  // TODO: quando fontes reais chegarem, location.region não vai mais
  // bater com este bucket continental de 6 valores — precisará de um
  // lookup país→continente de verdade em vez desta leitura direta.
  if (isLegacyRegion(event.location.region)) return event.location.region;
  return "americas";
}

const SEVERITY_FALLBACK: LegacySeverity = "moderate";

function toLegacySeverity(severity: OrbiEvent["severity"]): LegacySeverity {
  if (severity === "unknown") return SEVERITY_FALLBACK;
  return severity;
}

function toLegacyPriority(priority: OrbiEvent["priority"]): LegacyEvent["priority"] {
  if (priority === "critical" || priority === "high") return 1;
  if (priority === "normal") return 2;
  return 3;
}

function minutesSince(isoDate: string): number {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  return Math.max(0, Math.round(diffMs / 60_000));
}

/** Rótulo relativo simples, no mesmo estilo usado pelos mocks atuais
 * ("há 12 min", "há 3 h", "há 2 d"). Cobre apenas pt-BR — a UI legada
 * já exibe esse campo como texto cru, sem passar pelo i18n. */
function formatRelativeLabel(minutesAgo: number): string {
  if (minutesAgo < 60) return `há ${minutesAgo} min`;
  const hours = Math.round(minutesAgo / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  return `há ${days} d`;
}

function getMagnitude(event: OrbiEvent): string {
  const raw = event.metadata?.["magnitude"];
  return typeof raw === "string" ? raw : "";
}

export function toLegacyEvent(event: OrbiEvent): LegacyEvent {
  const detectedMinutesAgo = minutesSince(event.detectedAt);

  return {
    id: event.id,
    title: event.title,
    place: event.location.name,
    lat: event.location.latitude,
    lng: event.location.longitude,
    category: toLegacyCategory(event),
    magnitude: getMagnitude(event),
    updated: formatRelativeLabel(detectedMinutesAgo),
    detectedMinutesAgo,
    severity: toLegacySeverity(event.severity),
    region: toLegacyRegion(event),
    priority: toLegacyPriority(event.priority),
  };
}

export function toLegacyEvents(events: OrbiEvent[]): LegacyEvent[] {
  return events.map(toLegacyEvent);
}

export { LEGACY_CATEGORIES };
