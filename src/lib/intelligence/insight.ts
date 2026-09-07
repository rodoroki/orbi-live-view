import type { OrbiEvent } from "@/lib/orbi-events";
import type { en } from "@/lib/i18n/locales/en";
import { format } from "@/lib/i18n";
import { buildContext } from "./context";
import { numericMagnitude } from "./relevance";

/**
 * ORBI INTELLIGENCE — Insight
 *
 * Interpretação determinística sobre dados já normalizados (ponto 24).
 * Fonte = fato. ORBI = interpretação. Nunca causalidade, nunca previsão.
 */

type Translations = typeof en;

export type InsightFact = { label: string; value: string };

export type OrbiInsight = {
  headline: string;
  summary: string;
  facts: InsightFact[];
  context: string;
  hasContext: boolean;
  sources: string[];
};

/** Fonte declarada pelo id normalizado do evento. */
export function sourceOf(event: OrbiEvent): string {
  if (event.id.startsWith("usgs-")) return "USGS";
  if (event.id.startsWith("nws-")) return "NOAA/NWS";
  if (event.id.startsWith("eonet-")) return "NASA EONET";
  return "ORBI";
}

function elapsedLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} h`;
  return `${Math.round(minutes / 1440)} d`;
}

export function buildInsight(event: OrbiEvent, all: OrbiEvent[], t: Translations): OrbiInsight {
  const phenomenon =
    t.discovery.phenomena[event.category as keyof typeof t.discovery.phenomena] ?? "";
  const source = sourceOf(event);
  const elapsed = elapsedLabel(event.detectedMinutesAgo);
  const ctx = buildContext(event, all);

  const facts: InsightFact[] = [];
  const mag = numericMagnitude(event);
  if (mag !== null) facts.push({ label: t.insight.magnitude, value: event.magnitude });
  facts.push({
    label: t.insight.severity,
    value: t.severity[event.severity],
  });
  facts.push({
    label: t.insight.detected,
    value: format(t.discovery.detected, { time: elapsed }),
  });

  let context = t.insight.noContext;
  if (ctx.recentNearby.length > 0) {
    context = format(t.insight.nearby, {
      count: ctx.recentNearby.length,
      hours: ctx.windowHours,
    });
    if (ctx.sameKind.length > 1) {
      context += ` ${format(t.insight.sameKind, { count: ctx.sameKind.length, phenomenon: phenomenon.toLowerCase() })}`;
    }
  } else if (ctx.sameKind.length > 0) {
    context = format(t.insight.sameKind, {
      count: ctx.sameKind.length,
      phenomenon: phenomenon.toLowerCase(),
    });
  }

  return {
    headline: format(t.insight.headline, { phenomenon }),
    summary: format(t.insight.summary, {
      phenomenon,
      place: event.place,
      source,
    }),
    facts,
    context,
    hasContext: ctx.hasContext,
    sources: [source],
  };
}
