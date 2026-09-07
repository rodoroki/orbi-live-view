import type { OrbiEvent } from "@/lib/orbi-events";
import { distanceKm } from "./relevance";

/**
 * ORBI INTELLIGENCE — Context Engine
 *
 * Encontra relações entre eventos por espaço, tempo e tipo.
 * Proximidade nunca é tratada como causalidade (ponto 8).
 */

export type EventContext = {
  /** eventos próximos geograficamente (raio padrão: 500 km) */
  nearby: OrbiEvent[];
  /** eventos próximos no espaço E no tempo */
  recentNearby: OrbiEvent[];
  /** eventos próximos do mesmo fenômeno */
  sameKind: OrbiEvent[];
  /** janela temporal considerada, em horas */
  windowHours: number;
  radiusKm: number;
  hasContext: boolean;
};

export function buildContext(
  event: OrbiEvent,
  all: OrbiEvent[],
  options: { radiusKm?: number; windowHours?: number } = {},
): EventContext {
  const radiusKm = options.radiusKm ?? 500;
  const windowHours = options.windowHours ?? 48;

  const nearby = all.filter(
    (other) => other.id !== event.id && distanceKm(other, event) <= radiusKm,
  );
  const recentNearby = nearby.filter(
    (other) => other.detectedMinutesAgo <= windowHours * 60,
  );
  const sameKind = nearby.filter((other) => other.category === event.category);

  return {
    nearby,
    recentNearby,
    sameKind,
    windowHours,
    radiusKm,
    hasContext: recentNearby.length > 0 || sameKind.length > 0,
  };
}
