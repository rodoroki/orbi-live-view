/**
 * ORBI LIVE — Scene Evaluation & Scoring.
 *
 * Motor determinístico: cada fator tem uma responsabilidade explicável e
 * devolve, junto do número, a razão em texto. Nada aleatório, nada de IA.
 *
 *   TOTAL = visualQuality + geographicDiversity + freshness
 *         + temporalInterest + weatherInterest + eventRelevance
 *         - repetitionPenalty
 */
import { nearestEvent, type NaturalEvent } from "@/lib/nasa/events";
import type { DiscoveredWebcam } from "./discovery";
import { webcamToScene, type LiveScene } from "./scene";

export type SceneMode = "world" | "now";

export type SceneCandidate = {
  scene: LiveScene;
  score: number;
  reasons: string[];
  continent: string;
};

/** Memória leve em runtime do que já foi ao ar (mais recente primeiro). */
export type SceneMemory = {
  sceneIds: string[];
  cities: string[];
  countries: string[];
  continents: string[];
};

export const EMPTY_MEMORY: SceneMemory = {
  sceneIds: [],
  cities: [],
  countries: [],
  continents: [],
};

/** Sinais meteorológicos já disponíveis na infraestrutura existente. */
export type WeatherSignal = {
  windKt?: number | undefined;
  precipMmH?: number | undefined;
  cloudPct?: number | undefined;
};

export type ScoringContext = {
  mode: SceneMode;
  now: Date;
  memory: SceneMemory;
  events: NaturalEvent[];
  /** devolve o clima já em cache para a cena, ou null — nunca busca dados novos */
  weatherFor?: (scene: LiveScene) => WeatherSignal | null;
};

/** Quantas cenas de história a memória mantém. */
export const MEMORY_SIZE = 12;

function push(list: string[], value: string | null | undefined): string[] {
  if (!value) return list.slice(0, MEMORY_SIZE);
  return [value, ...list.filter((v) => v !== value)].slice(0, MEMORY_SIZE);
}

export function rememberScene(
  memory: SceneMemory,
  candidate: SceneCandidate,
  cam?: { city?: string | undefined; country?: string | undefined },
): SceneMemory {
  return {
    sceneIds: push(memory.sceneIds, candidate.scene.id),
    cities: push(memory.cities, cam?.city ?? candidate.scene.place),
    countries: push(memory.countries, cam?.country ?? candidate.scene.area),
    continents: push(memory.continents, candidate.continent),
  };
}

/**
 * 1. Qualidade visual — apenas sinais declarados pela fonte.
 * Sem visão computacional: este é o contrato para isso existir depois.
 */
export function visualQuality(cam: DiscoveredWebcam): number {
  let score = 0;
  if (cam.imageUrl) score += 12;
  if (cam.city) score += 4;
  if (cam.region || cam.country) score += 3;
  if (cam.timezone) score += 3;
  if (cam.title && cam.title !== "Webcam") score += 2;
  return score;
}

/** 2. Diversidade geográfica — favorece o que ainda não apareceu. */
export function geographicDiversity(
  cam: DiscoveredWebcam,
  memory: SceneMemory,
): number {
  let score = 0;
  if (!memory.continents.includes(cam.origin.continent)) score += 14;
  if (cam.country && !memory.countries.includes(cam.country)) score += 8;
  if (cam.city && !memory.cities.includes(cam.city)) score += 6;
  return score;
}

/** 3. Freshness — cena inédita nesta sessão vale mais. */
export function freshness(cam: DiscoveredWebcam, memory: SceneMemory): number {
  return memory.sceneIds.includes(cam.id) ? 0 : 10;
}

/** Hora local declarada pela fonte; null quando não há fuso confiável. */
export function localHour(timezone: string | undefined, now: Date): number | null {
  if (!timezone) return null;
  try {
    const hour = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      hour12: false,
      timeZone: timezone,
    }).format(now);
    const parsed = Number(hour);
    return Number.isFinite(parsed) ? parsed % 24 : null;
  } catch {
    return null;
  }
}

/** 4. Interesse temporal — amanhecer, pôr do sol, noite urbana, dia natural. */
export function temporalInterest(
  cam: DiscoveredWebcam,
  now: Date,
): { score: number; reason: string | null } {
  const hour = localHour(cam.timezone, now);
  if (hour === null) return { score: 0, reason: null };

  if (hour >= 5 && hour < 8) return { score: 16, reason: "+ sunrise window" };
  if (hour >= 17 && hour < 20) return { score: 16, reason: "+ sunset window" };
  if (hour >= 20 || hour < 5) {
    return cam.city
      ? { score: 9, reason: "+ city at night" }
      : { score: 2, reason: "+ night scene" };
  }
  return cam.city ? { score: 5, reason: "+ daylight city" } : { score: 8, reason: "+ daylight landscape" };
}

/** 5. Interesse meteorológico — só com dados que já existem em cache. */
export function weatherInterest(signal: WeatherSignal | null): {
  score: number;
  reason: string | null;
} {
  if (!signal) return { score: 0, reason: null };
  let score = 0;
  const parts: string[] = [];
  if ((signal.precipMmH ?? 0) >= 0.5) {
    score += 10;
    parts.push("rain");
  }
  if ((signal.windKt ?? 0) >= 20) {
    score += 8;
    parts.push("strong wind");
  }
  if ((signal.cloudPct ?? 0) >= 80) {
    score += 4;
    parts.push("heavy clouds");
  }
  return { score, reason: parts.length > 0 ? `+ weather interest (${parts.join(", ")})` : null };
}

/** 6. Relevância de evento — câmera perto de um evento natural real. */
export function eventRelevance(
  cam: DiscoveredWebcam,
  events: NaturalEvent[],
  mode: SceneMode,
): { score: number; reason: string | null } {
  if (events.length === 0) return { score: 0, reason: null };
  const near = nearestEvent(events, cam.lat, cam.lng, 300);
  if (!near) return { score: 0, reason: null };

  const proximity = 1 - near.km / 300; // 0…1
  const base = 20 * proximity;
  const score = Math.round(mode === "now" ? base * 2 : base);
  return { score, reason: `+ natural event nearby (${near.event.title})` };
}

/** 7. Penalidade de repetição — quanto mais recente, maior a punição. */
export function repetitionPenalty(cam: DiscoveredWebcam, memory: SceneMemory): {
  score: number;
  reasons: string[];
} {
  const reasons: string[] = [];
  let penalty = 0;

  const sceneIndex = memory.sceneIds.indexOf(cam.id);
  if (sceneIndex >= 0) {
    penalty += Math.round(60 / (sceneIndex + 1));
    reasons.push("- recently shown scene");
  }
  if (cam.city && memory.cities.indexOf(cam.city) >= 0) {
    penalty += Math.round(20 / (memory.cities.indexOf(cam.city) + 1));
    reasons.push("- recent city penalty");
  }
  if (cam.country && memory.countries.indexOf(cam.country) >= 0) {
    penalty += Math.round(10 / (memory.countries.indexOf(cam.country) + 1));
    reasons.push("- recent country penalty");
  }
  return { score: penalty, reasons };
}

/** Avalia um candidato: transforma webcam real em cena pontuada e explicada. */
export function evaluateCandidate(
  cam: DiscoveredWebcam,
  context: ScoringContext,
): SceneCandidate {
  const scene = webcamToScene(cam);
  const reasons: string[] = [];

  const quality = visualQuality(cam);
  if (quality > 0) reasons.push("+ image and metadata available");

  const diversity = geographicDiversity(cam, context.memory);
  if (diversity > 0) reasons.push("+ geographic diversity");

  const fresh = freshness(cam, context.memory);
  if (fresh > 0) reasons.push("+ fresh scene");

  const temporal = temporalInterest(cam, context.now);
  if (temporal.reason) reasons.push(temporal.reason);

  const weather = weatherInterest(context.weatherFor?.(scene) ?? null);
  if (weather.reason) reasons.push(weather.reason);

  const event = eventRelevance(cam, context.events, context.mode);
  if (event.reason) reasons.push(event.reason);

  const penalty = repetitionPenalty(cam, context.memory);
  reasons.push(...penalty.reasons);

  // WORLD valoriza beleza e variedade; NOW valoriza o que está acontecendo.
  const worldWeight = context.mode === "world" ? 1.25 : 0.75;
  const score =
    Math.round(
      quality +
        diversity * worldWeight +
        fresh +
        temporal.score * worldWeight +
        weather.score +
        event.score,
    ) - penalty.score;

  return { scene, score, reasons, continent: cam.origin.continent };
}

/** Ordena candidatos e devolve o melhor primeiro. */
export function rankCandidates(
  cams: DiscoveredWebcam[],
  context: ScoringContext,
): SceneCandidate[] {
  return cams
    .filter((cam) => Boolean(cam.imageUrl))
    .map((cam) => evaluateCandidate(cam, context))
    .sort((a, b) => b.score - a.score);
}

/** Observabilidade: só em desenvolvimento, nunca visível ao usuário final. */
export function debugSelection(candidate: SceneCandidate, mode: SceneMode): void {
  if (!import.meta.env.DEV) return;
  console.debug(
    `[ORBI selector:${mode}] ${candidate.scene.place} — score ${candidate.score}\n` +
      candidate.reasons.map((r) => `  ${r}`).join("\n"),
  );
}
