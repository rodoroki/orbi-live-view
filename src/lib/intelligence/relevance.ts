import type { OrbiEvent } from "@/lib/orbi-events";

/**
 * ORBI INTELLIGENCE — Relevance Engine
 *
 * Camada independente da interface (ponto 22). Recebe o modelo de
 * evento já normalizado e decide o que merece atenção agora.
 * Não inventa dados: apenas pondera o que as fontes forneceram.
 */

export type RelevanceInput = {
  /** posição do observador, quando disponível */
  origin?: { lat: number; lng: number } | null;
  /** universo de eventos, usado para densidade geográfica */
  all?: OrbiEvent[];
};

const SEVERITY_WEIGHT: Record<OrbiEvent["severity"], number> = {
  critical: 40,
  high: 28,
  moderate: 16,
  low: 6,
};

/** Distância aproximada em km (haversine). */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Magnitude numérica quando a fonte a expõe (ex.: "M 5.8"). */
export function numericMagnitude(event: OrbiEvent): number | null {
  const match = event.magnitude?.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

/** Pontuação 0–100. Quanto maior, mais merece aparecer agora. */
export function relevanceScore(event: OrbiEvent, input: RelevanceInput = {}): number {
  let score = SEVERITY_WEIGHT[event.severity] ?? 10;

  // recência — o que acabou de acontecer importa mais
  const hours = event.detectedMinutesAgo / 60;
  score += hours <= 3 ? 24 : hours <= 12 ? 16 : hours <= 48 ? 9 : 2;

  // magnitude declarada pela fonte
  const mag = numericMagnitude(event);
  if (mag !== null) score += Math.max(0, Math.min(18, (mag - 3) * 4));

  // proximidade do observador
  if (input.origin) {
    const d = distanceKm(input.origin, event);
    score += d < 300 ? 20 : d < 1000 ? 13 : d < 3000 ? 6 : 0;
  }

  // densidade: regiões com vários eventos contam uma história maior
  if (input.all?.length) {
    const near = input.all.filter(
      (other) => other.id !== event.id && distanceKm(other, event) < 500,
    ).length;
    score += Math.min(10, near * 2.5);
  }

  // lugares com nome contam história melhor que coordenadas cruas
  if (!/^-?\d/.test(event.place)) score += 4;

  return Math.round(Math.min(100, score));
}

/** Ordena por relevância decrescente. */
export function rankEvents(events: OrbiEvent[], input: RelevanceInput = {}): OrbiEvent[] {
  const scoped: RelevanceInput = { ...input, all: input.all ?? events };
  return [...events].sort(
    (a, b) => relevanceScore(b, scoped) - relevanceScore(a, scoped),
  );
}
