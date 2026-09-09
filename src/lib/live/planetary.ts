/**
 * ORBI LIVE — Planetary Discovery.
 *
 * Responsabilidade única: decidir ONDE vale a pena procurar webcams.
 * Não avalia candidatos (isso é do scoring) e não escolhe cena (isso é do selector).
 *
 * O universo é um catálogo macro declarativo do planeta. A cada ciclo apenas
 * uma janela pequena de regiões fica ativa (request budget), percorrida em
 * round-robin e corrigida por saúde de região aprendida em runtime.
 */

export type RegionHealthState = "unknown" | "healthy" | "weak" | "empty" | "failed";

export type PlanetaryRegion = {
  id: string;
  continent: string;
  lat: number;
  lng: number;
  /** peso estático leve: 1 = normal, >1 = costuma render boas cenas */
  priority?: number;
  /** sinais geográficos declarativos, usados só para diversidade de paisagem */
  tags?: string[];
};

/** Universo de descoberta: pontos de observação macro, não conteúdo. */
export const PLANETARY_REGIONS: readonly PlanetaryRegion[] = [
  // South America
  { id: "balneario-camboriu", continent: "south-america", lat: -26.99, lng: -48.63, priority: 1.2, tags: ["coast", "city"] },
  { id: "rio-de-janeiro", continent: "south-america", lat: -22.91, lng: -43.18, priority: 1.2, tags: ["coast", "city"] },
  { id: "sao-paulo", continent: "south-america", lat: -23.55, lng: -46.63, tags: ["city"] },
  { id: "florianopolis", continent: "south-america", lat: -27.6, lng: -48.55, tags: ["island", "beach"] },
  { id: "salvador", continent: "south-america", lat: -12.97, lng: -38.5, tags: ["coast"] },
  { id: "amazon-manaus", continent: "south-america", lat: -3.12, lng: -60.02, tags: ["forest", "river"] },
  { id: "patagonia-bariloche", continent: "south-america", lat: -41.13, lng: -71.31, tags: ["mountain", "lake"] },
  { id: "ushuaia", continent: "south-america", lat: -54.8, lng: -68.3, tags: ["port", "mountain"] },
  { id: "andes-santiago", continent: "south-america", lat: -33.45, lng: -70.67, tags: ["mountain", "city"] },
  { id: "valparaiso", continent: "south-america", lat: -33.05, lng: -71.62, tags: ["port", "coast"] },
  { id: "buenos-aires", continent: "south-america", lat: -34.6, lng: -58.38, tags: ["city"] },
  { id: "atacama", continent: "south-america", lat: -22.91, lng: -68.2, tags: ["desert"] },
  { id: "cusco-andes", continent: "south-america", lat: -13.53, lng: -71.97, tags: ["mountain"] },
  { id: "cartagena", continent: "south-america", lat: 10.39, lng: -75.51, tags: ["coast"] },
  { id: "galapagos", continent: "south-america", lat: -0.74, lng: -90.31, tags: ["island"] },

  // North America
  { id: "new-york", continent: "north-america", lat: 40.71, lng: -74.01, priority: 1.1, tags: ["city"] },
  { id: "san-francisco", continent: "north-america", lat: 37.77, lng: -122.42, tags: ["city", "coast"] },
  { id: "rocky-mountains", continent: "north-america", lat: 50.45, lng: -116.0, tags: ["mountain", "ski"] },
  { id: "banff", continent: "north-america", lat: 51.18, lng: -115.57, tags: ["park", "mountain"] },
  { id: "alaska-anchorage", continent: "north-america", lat: 61.22, lng: -149.9, tags: ["mountain", "remote"] },
  { id: "yellowstone", continent: "north-america", lat: 44.6, lng: -110.5, tags: ["park", "volcanic"] },
  { id: "grand-canyon", continent: "north-america", lat: 36.06, lng: -112.14, tags: ["desert", "park"] },
  { id: "florida-keys", continent: "north-america", lat: 24.56, lng: -81.78, tags: ["island", "beach"] },
  { id: "chicago", continent: "north-america", lat: 41.88, lng: -87.63, tags: ["city", "lake"] },
  { id: "vancouver", continent: "north-america", lat: 49.28, lng: -123.12, tags: ["city", "coast"] },
  { id: "mexico-city", continent: "north-america", lat: 19.43, lng: -99.13, tags: ["city"] },
  { id: "yucatan", continent: "north-america", lat: 20.62, lng: -87.08, tags: ["beach"] },
  { id: "hawaii-volcanoes", continent: "north-america", lat: 19.42, lng: -155.29, tags: ["volcano", "island"] },
  { id: "quebec", continent: "north-america", lat: 46.81, lng: -71.21, tags: ["city", "river"] },
  { id: "havana", continent: "north-america", lat: 23.11, lng: -82.37, tags: ["city", "coast"] },

  // Europe
  { id: "reykjavik", continent: "europe", lat: 64.15, lng: -21.94, priority: 1.2, tags: ["volcano", "coast"] },
  { id: "dolomites", continent: "europe", lat: 46.05, lng: 11.12, priority: 1.2, tags: ["mountain", "ski"] },
  { id: "swiss-alps", continent: "europe", lat: 46.55, lng: 8.0, priority: 1.2, tags: ["mountain", "ski"] },
  { id: "lisbon", continent: "europe", lat: 38.72, lng: -9.14, tags: ["city", "coast"] },
  { id: "canary-islands", continent: "europe", lat: 28.29, lng: -16.63, tags: ["island", "volcano"] },
  { id: "madeira", continent: "europe", lat: 32.65, lng: -16.91, tags: ["island"] },
  { id: "barcelona", continent: "europe", lat: 41.39, lng: 2.17, tags: ["city", "coast"] },
  { id: "amalfi-coast", continent: "europe", lat: 40.63, lng: 14.6, tags: ["coast"] },
  { id: "santorini", continent: "europe", lat: 36.39, lng: 25.46, tags: ["island"] },
  { id: "norway-fjords", continent: "europe", lat: 61.0, lng: 6.5, tags: ["fjord", "mountain"] },
  { id: "lofoten", continent: "europe", lat: 68.2, lng: 13.9, tags: ["island", "arctic"] },
  { id: "stockholm", continent: "europe", lat: 59.33, lng: 18.07, tags: ["city"] },
  { id: "scottish-highlands", continent: "europe", lat: 57.12, lng: -4.71, tags: ["mountain", "lake"] },
  { id: "amsterdam", continent: "europe", lat: 52.37, lng: 4.9, tags: ["city", "port"] },
  { id: "paris", continent: "europe", lat: 48.86, lng: 2.35, tags: ["city"] },
  { id: "prague", continent: "europe", lat: 50.08, lng: 14.44, tags: ["city"] },
  { id: "tatra-mountains", continent: "europe", lat: 49.25, lng: 19.98, tags: ["mountain"] },
  { id: "dubrovnik", continent: "europe", lat: 42.65, lng: 18.09, tags: ["coast"] },
  { id: "etna", continent: "europe", lat: 37.75, lng: 14.99, tags: ["volcano"] },

  // Asia
  { id: "tokyo", continent: "asia", lat: 35.68, lng: 139.69, priority: 1.1, tags: ["city"] },
  { id: "mount-fuji", continent: "asia", lat: 35.36, lng: 138.73, tags: ["mountain", "volcano"] },
  { id: "hokkaido", continent: "asia", lat: 43.06, lng: 141.35, tags: ["ski", "mountain"] },
  { id: "seoul", continent: "asia", lat: 37.57, lng: 126.98, tags: ["city"] },
  { id: "hong-kong", continent: "asia", lat: 22.32, lng: 114.17, tags: ["city", "port"] },
  { id: "taipei", continent: "asia", lat: 25.03, lng: 121.57, tags: ["city"] },
  { id: "bangkok", continent: "asia", lat: 13.76, lng: 100.5, tags: ["city", "river"] },
  { id: "phuket", continent: "asia", lat: 7.89, lng: 98.4, tags: ["beach", "island"] },
  { id: "bali", continent: "asia", lat: -8.65, lng: 115.22, tags: ["island", "volcano"] },
  { id: "himalaya-everest", continent: "asia", lat: 27.99, lng: 86.93, tags: ["mountain"] },
  { id: "kathmandu", continent: "asia", lat: 27.72, lng: 85.32, tags: ["city", "mountain"] },
  { id: "singapore", continent: "asia", lat: 1.35, lng: 103.82, tags: ["city", "port"] },
  { id: "dubai", continent: "asia", lat: 25.2, lng: 55.27, tags: ["city", "desert"] },
  { id: "istanbul", continent: "asia", lat: 41.01, lng: 28.98, tags: ["city", "strait"] },
  { id: "cappadocia", continent: "asia", lat: 38.64, lng: 34.83, tags: ["desert"] },
  { id: "maldives", continent: "asia", lat: 4.18, lng: 73.51, tags: ["island", "beach"] },
  { id: "kamchatka", continent: "asia", lat: 53.02, lng: 158.65, tags: ["volcano", "remote"] },
  { id: "baikal", continent: "asia", lat: 51.85, lng: 104.87, tags: ["lake", "remote"] },

  // Africa
  { id: "cape-town", continent: "africa", lat: -33.92, lng: 18.42, priority: 1.1, tags: ["city", "coast"] },
  { id: "atlas-marrakech", continent: "africa", lat: 31.63, lng: -7.99, tags: ["mountain", "desert"] },
  { id: "sahara-merzouga", continent: "africa", lat: 31.1, lng: -4.01, tags: ["desert"] },
  { id: "cairo-nile", continent: "africa", lat: 30.04, lng: 31.24, tags: ["city", "river"] },
  { id: "red-sea-hurghada", continent: "africa", lat: 27.26, lng: 33.81, tags: ["coast", "beach"] },
  { id: "kilimanjaro", continent: "africa", lat: -3.07, lng: 37.36, tags: ["mountain"] },
  { id: "serengeti", continent: "africa", lat: -2.33, lng: 34.83, tags: ["park", "rural"] },
  { id: "victoria-falls", continent: "africa", lat: -17.92, lng: 25.86, tags: ["river", "park"] },
  { id: "zanzibar", continent: "africa", lat: -6.16, lng: 39.2, tags: ["island", "beach"] },
  { id: "nairobi", continent: "africa", lat: -1.29, lng: 36.82, tags: ["city"] },
  { id: "lagos", continent: "africa", lat: 6.52, lng: 3.38, tags: ["city", "port"] },
  { id: "madagascar", continent: "africa", lat: -18.88, lng: 47.51, tags: ["island"] },
  { id: "canary-african-coast", continent: "africa", lat: 23.68, lng: -15.93, tags: ["coast", "desert"] },

  // Oceania
  { id: "sydney", continent: "oceania", lat: -33.86, lng: 151.21, priority: 1.1, tags: ["city", "coast"] },
  { id: "gold-coast", continent: "oceania", lat: -28.0, lng: 153.43, tags: ["beach"] },
  { id: "great-barrier-reef", continent: "oceania", lat: -16.92, lng: 145.77, tags: ["coast", "island"] },
  { id: "melbourne", continent: "oceania", lat: -37.81, lng: 144.96, tags: ["city"] },
  { id: "perth", continent: "oceania", lat: -31.95, lng: 115.86, tags: ["city", "coast"] },
  { id: "queenstown", continent: "oceania", lat: -45.03, lng: 168.66, tags: ["mountain", "lake"] },
  { id: "auckland", continent: "oceania", lat: -36.85, lng: 174.76, tags: ["city", "port"] },
  { id: "tongariro", continent: "oceania", lat: -39.13, lng: 175.65, tags: ["volcano", "park"] },
  { id: "fiji", continent: "oceania", lat: -18.14, lng: 178.44, tags: ["island"] },
  { id: "tahiti", continent: "oceania", lat: -17.65, lng: -149.43, tags: ["island"] },

  // Polar / remote — podem simplesmente não ter candidatos
  { id: "svalbard", continent: "polar", lat: 78.22, lng: 15.63, tags: ["arctic", "remote"] },
  { id: "greenland-ilulissat", continent: "polar", lat: 69.22, lng: -51.1, tags: ["arctic", "ice"] },
  { id: "antarctica-peninsula", continent: "polar", lat: -64.77, lng: -64.05, tags: ["antarctic", "remote"] },
  { id: "antarctica-mcmurdo", continent: "polar", lat: -77.85, lng: 166.67, tags: ["antarctic", "remote"] },
];

/** Request budget: quantas regiões podem ficar ativas ao mesmo tempo. */
export const MAX_ACTIVE_DISCOVERY_REGIONS = 4;
/** Quantas regiões o round-robin examina por ciclo antes de escolher a janela. */
const SCAN_SIZE = 18;
/** No máximo duas regiões do mesmo continente por janela (diversidade). */
const MAX_PER_CONTINENT = 2;

const COOLDOWN_MS: Record<RegionHealthState, number> = {
  unknown: 0,
  healthy: 0,
  weak: 2 * 60_000,
  empty: 30 * 60_000,
  failed: 10 * 60_000,
};

type RegionHealth = {
  state: RegionHealthState;
  cooledUntil: number;
  lastVisitedAt: number;
  lastCount: number;
};

const health = new Map<string, RegionHealth>();

function debug(message: string): void {
  if (import.meta.env.DEV) console.debug(`[ORBI DISCOVERY] ${message}`);
}

export function regionHealth(id: string): RegionHealth {
  return health.get(id) ?? { state: "unknown", cooledUntil: 0, lastVisitedAt: 0, lastCount: 0 };
}

/** Aprendizado leve em runtime: o que cada região realmente devolveu. */
export function recordRegionResult(
  id: string,
  outcome: { count: number; failed?: boolean },
  now = Date.now(),
): void {
  const state: RegionHealthState = outcome.failed
    ? "failed"
    : outcome.count === 0
      ? "empty"
      : outcome.count < 3
        ? "weak"
        : "healthy";
  const previous = regionHealth(id);
  if (previous.state !== state) debug(`region priority updated: ${id} → ${state}`);
  if (state === "empty" || state === "failed") debug(`region cooldown: ${id} (${state})`);
  health.set(id, {
    state,
    cooledUntil: now + COOLDOWN_MS[state],
    lastVisitedAt: now,
    lastCount: outcome.count,
  });
}

/** Só para testes determinísticos. */
export function resetRegionHealth(): void {
  health.clear();
}

function isAvailable(region: PlanetaryRegion, now: number): boolean {
  return regionHealth(region.id).cooledUntil <= now;
}

/**
 * Prioridade de descoberta — responde "onde vale a pena procurar?".
 * Nunca decide qual câmera entra no ar; isso continua sendo do scoring.
 */
function discoveryPriority(
  region: PlanetaryRegion,
  now: number,
  eventPoints: ReadonlyArray<{ lat: number; lng: number }>,
): number {
  const state = regionHealth(region.id);
  let score = (region.priority ?? 1) * 10;

  if (state.state === "healthy") score += 8;
  if (state.state === "weak") score -= 4;
  if (state.state === "unknown") score += 6; // ainda inexplorada nesta sessão

  // regiões vistas há mais tempo voltam ao topo — round-robin justo
  const minutesSinceVisit = state.lastVisitedAt ? (now - state.lastVisitedAt) / 60_000 : 60;
  score += Math.min(minutesSinceVisit, 60) / 6;

  // sinal de prioridade geográfica: evento natural real por perto
  if (eventPoints.some((p) => Math.abs(p.lat - region.lat) < 6 && Math.abs(p.lng - region.lng) < 6)) {
    score += 12;
  }
  return score;
}

/**
 * Janela deslizante planetária: um subconjunto pequeno do universo,
 * avançando por round-robin, com espalhamento entre continentes.
 */
export function planetaryWindow(
  offset: number,
  size = MAX_ACTIVE_DISCOVERY_REGIONS,
  options: { now?: number; eventPoints?: ReadonlyArray<{ lat: number; lng: number }> } = {},
): PlanetaryRegion[] {
  const now = options.now ?? Date.now();
  const events = options.eventPoints ?? [];
  const total = PLANETARY_REGIONS.length;
  const start = ((offset % total) + total) % total;

  const scanned = Array.from(
    { length: Math.min(SCAN_SIZE, total) },
    (_, i) => PLANETARY_REGIONS[(start + i) % total]!,
  );

  const pool = scanned.filter((region) => isAvailable(region, now));
  const ordered = (pool.length > 0 ? pool : scanned)
    .map((region) => ({ region, priority: discoveryPriority(region, now, events) }))
    .sort((a, b) => b.priority - a.priority);

  const picked: PlanetaryRegion[] = [];
  const perContinent = new Map<string, number>();
  for (const { region } of ordered) {
    if (picked.length >= size) break;
    const used = perContinent.get(region.continent) ?? 0;
    if (used >= MAX_PER_CONTINENT) continue;
    perContinent.set(region.continent, used + 1);
    picked.push(region);
  }
  // completa a janela se a restrição de continente tiver sido restritiva demais
  for (const { region } of ordered) {
    if (picked.length >= size) break;
    if (!picked.includes(region)) picked.push(region);
  }

  debug(`planetary window advanced: ${picked.map((r) => r.id).join(", ")}`);
  return picked;
}
