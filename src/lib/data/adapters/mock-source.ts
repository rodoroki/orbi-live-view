import { ORBI_EVENTS, type EventCategory, type OrbiEvent as LegacyEvent, type OrbiRegion } from "@/lib/orbi-events";
import type { OrbiDataSource } from "../types";
import type { OrbiEvent, Priority, Severity, Status } from "@/lib/schemas";

/**
 * ORBI DATA CORE — Mock Adapter
 *
 * Converte os dados fictícios atuais (src/lib/orbi-events.ts) para o
 * modelo canônico OrbiEvent. Ver ponto 6 e 34 do plano de continuidade.
 *
 * Esta é a PRIMEIRA implementação de OrbiDataSource — trata o mock
 * como se fosse "uma fonte" para provar a arquitetura antes de plugar
 * o NASA EONET de verdade. Nenhum componente de UI importa este
 * arquivo ainda; ele só alimenta o adapter de visualização (ver
 * legacy-view-adapter.ts) e os testes de compatibilidade.
 */

// category legada -> { category, phenomenon } na nova taxonomia.
const CATEGORY_MAP: Record<EventCategory, { category: string; phenomenon: string }> = {
  fire: { category: "fire", phenomenon: "wildfire" },
  volcano: { category: "geology", phenomenon: "volcanic-eruption" },
  quake: { category: "geology", phenomenon: "earthquake" },
  storm: { category: "weather", phenomenon: "storm" }, // refinado por inferStormPhenomenon
  ocean: { category: "ocean", phenomenon: "ocean-current" }, // refinado por inferOceanPhenomenon
  atmosphere: { category: "atmosphere", phenomenon: "dust-storm" },
};

/** Heurística leve para diferenciar sub-tipos de tempestade a partir do título. */
function inferStormPhenomenon(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("ciclone")) return "cyclone";
  if (t.includes("furacão") || t.includes("hurricane")) return "hurricane";
  if (t.includes("depressão tropical") || t.includes("tropical")) return "tropical-storm";
  if (t.includes("tufão") || t.includes("typhoon")) return "typhoon";
  return "storm";
}

/** Heurística leve para diferenciar sub-tipos de evento oceânico a partir da magnitude. */
function inferOceanPhenomenon(magnitude: string): string {
  if (magnitude.includes("°C")) return "sea-surface-temperature";
  if (magnitude.toLowerCase().includes("swell")) return "swell";
  return "ocean-current";
}

/** priority legado (1|2|3) -> priority canônico. Ver ponto 14. */
const PRIORITY_MAP: Record<LegacyEvent["priority"], Priority> = {
  1: "high",
  2: "normal",
  3: "low",
};

/** severity legado é um subconjunto do canônico — passagem direta. */
function toCanonicalSeverity(severity: LegacyEvent["severity"]): Severity {
  return severity;
}

/** tags derivadas de severidade — só para dar algum conteúdo inicial às tags. */
function deriveTags(severity: LegacyEvent["severity"]): string[] {
  if (severity === "critical") return ["extreme", "severe"];
  if (severity === "high") return ["severe"];
  return [];
}

function legacyToOrbiEvent(legacy: LegacyEvent, now: number): OrbiEvent {
  const mapping = { ...CATEGORY_MAP[legacy.category] };
  if (legacy.category === "storm") {
    mapping.phenomenon = inferStormPhenomenon(legacy.title);
  } else if (legacy.category === "ocean") {
    mapping.phenomenon = inferOceanPhenomenon(legacy.magnitude);
  }

  const detectedAt = new Date(now - legacy.detectedMinutesAgo * 60_000).toISOString();
  const status: Status = "active";

  return {
    id: legacy.id,
    title: legacy.title,
    category: mapping.category,
    phenomenon: mapping.phenomenon,
    tags: deriveTags(legacy.severity),
    location: {
      latitude: legacy.lat,
      longitude: legacy.lng,
      name: legacy.place,
      // Bucket continental legado (americas/europe/africa/asia/oceania/oceans).
      // TODO: quando integrarmos fontes reais (EONET/USGS/NOAA), este campo
      // deve vir de um lookup país→continente de verdade, não copiado do mock.
      region: legacy.region,
      entityType: "area",
    },
    status,
    severity: toCanonicalSeverity(legacy.severity),
    priority: PRIORITY_MAP[legacy.priority],
    detectedAt,
    updatedAt: detectedAt,
    source: {
      id: "orbi-mock",
      name: "ORBI Mock Data",
      type: "other",
    },
    geometry: {
      type: "Point",
      coordinates: [legacy.lng, legacy.lat],
    },
    metadata: {
      // Leitura de magnitude é heterogênea por fonte (FRP, magnitude sísmica,
      // vento, temperatura, AOD...) — ainda não é um campo de primeira classe.
      magnitude: legacy.magnitude,
    },
  };
}

export function mockEventsToOrbiEvents(): OrbiEvent[] {
  const now = Date.now();
  return ORBI_EVENTS.map((event) => legacyToOrbiEvent(event, now));
}

export const mockDataSource: OrbiDataSource = {
  id: "orbi-mock",
  name: "ORBI Mock Data",
  async fetchEvents(): Promise<OrbiEvent[]> {
    return mockEventsToOrbiEvents();
  },
};

// Re-exportado apenas para o adapter reverso e testes de compatibilidade.
export type { OrbiRegion };
