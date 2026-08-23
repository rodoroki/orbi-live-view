export type EventCategory =
  | "fire"
  | "storm"
  | "volcano"
  | "quake"
  | "ocean"
  | "atmosphere";

export type EventSeverity = "critical" | "high" | "moderate" | "low";

export type OrbiRegion =
  | "americas"
  | "europe"
  | "africa"
  | "asia"
  | "oceania"
  | "oceans";

export type OrbiEvent = {
  id: string;
  title: string;
  place: string;
  lat: number;
  lng: number;
  category: EventCategory;
  magnitude: string;
  updated: string;
  /** minutos desde a detecção — usado pelos filtros de período */
  detectedMinutesAgo: number;
  severity: EventSeverity;
  region: OrbiRegion;
  priority: 1 | 2 | 3;
};

export const CATEGORY_META: Record<
  EventCategory,
  { label: string; glyph: string; color: string }
> = {
  fire: { label: "Incêndios", glyph: "🔥", color: "#e08a4a" },
  storm: { label: "Tempestades", glyph: "🌪", color: "#7fa8dd" },
  volcano: { label: "Vulcões", glyph: "🌋", color: "#d1653f" },
  quake: { label: "Terremotos", glyph: "🌎", color: "#d8c168" },
  ocean: { label: "Oceanos", glyph: "🌊", color: "#5fb6c9" },
  atmosphere: { label: "Atmosféricos", glyph: "☁", color: "#b9c6cc" },
};

/** Contagens fictícias — "eventos agora" por categoria. */
export const CATEGORY_COUNTS: Record<EventCategory, number> = {
  fire: 342,
  storm: 27,
  volcano: 18,
  quake: 21,
  ocean: 14,
  atmosphere: 36,
};

export const SEVERITY_META: Record<
  EventSeverity,
  { label: string; color: string; rank: number }
> = {
  critical: { label: "Crítico", color: "#d1653f", rank: 4 },
  high: { label: "Alto", color: "#e08a4a", rank: 3 },
  moderate: { label: "Moderado", color: "#d8c168", rank: 2 },
  low: { label: "Baixo", color: "#8fa3ab", rank: 1 },
};

export const REGIONS: OrbiRegion[] = [
  "americas",
  "europe",
  "africa",
  "asia",
  "oceania",
  "oceans",
];

export const PERIODS = ["24h", "7d", "30d", "all"] as const;
export type OrbiPeriod = (typeof PERIODS)[number];

export const PERIOD_MINUTES: Record<OrbiPeriod, number> = {
  "24h": 60 * 24,
  "7d": 60 * 24 * 7,
  "30d": 60 * 24 * 30,
  all: Number.POSITIVE_INFINITY,
};

/** Dados fictícios — substituídos por NASA EONET / NOAA / USGS no futuro. */
export const ORBI_EVENTS: OrbiEvent[] = [
  {
    id: "fire-amz",
    title: "Foco de incêndio ativo",
    place: "Amazônia, Brasil",
    lat: -4.2,
    lng: -60.1,
    category: "fire",
    magnitude: "FRP 148 MW",
    updated: "há 12 min",
    detectedMinutesAgo: 12,
    severity: "critical",
    region: "americas",
    priority: 1,
  },
  {
    id: "fire-aus",
    title: "Incêndio florestal",
    place: "New South Wales, Austrália",
    lat: -32.4,
    lng: 149.8,
    category: "fire",
    magnitude: "FRP 96 MW",
    updated: "há 41 min",
    detectedMinutesAgo: 41,
    severity: "high",
    region: "oceania",
    priority: 1,
  },
  {
    id: "storm-atl-s",
    title: "Tempestade severa",
    place: "Atlântico Sul",
    lat: -28.5,
    lng: -35.2,
    category: "storm",
    magnitude: "Ventos 118 km/h",
    updated: "há 22 min",
    detectedMinutesAgo: 22,
    severity: "high",
    region: "oceans",
    priority: 1,
  },
  {
    id: "storm-pac",
    title: "Ciclone tropical",
    place: "Pacífico Sul",
    lat: -17.8,
    lng: -172.4,
    category: "storm",
    magnitude: "Cat. 2 · 155 km/h",
    updated: "há 34 min",
    detectedMinutesAgo: 34,
    severity: "critical",
    region: "oceans",
    priority: 1,
  },
  {
    id: "volcano-idn",
    title: "Erupção vulcânica",
    place: "Java, Indonésia",
    lat: -7.9,
    lng: 112.9,
    category: "volcano",
    magnitude: "VEI 3",
    updated: "há 1 h",
    detectedMinutesAgo: 62,
    severity: "critical",
    region: "asia",
    priority: 1,
  },
  {
    id: "volcano-isl",
    title: "Atividade vulcânica",
    place: "Reykjanes, Islândia",
    lat: 63.9,
    lng: -22.3,
    category: "volcano",
    magnitude: "VEI 2",
    updated: "há 3 h",
    detectedMinutesAgo: 180,
    severity: "moderate",
    region: "europe",
    priority: 2,
  },
  {
    id: "quake-peru",
    title: "Terremoto M5.8",
    place: "Arequipa, Peru",
    lat: -16.4,
    lng: -71.5,
    category: "quake",
    magnitude: "M 5.8 · 48 km",
    updated: "há 27 min",
    detectedMinutesAgo: 27,
    severity: "high",
    region: "americas",
    priority: 1,
  },
  {
    id: "quake-chile",
    title: "Sismo registrado",
    place: "Antofagasta, Chile",
    lat: -23.6,
    lng: -70.4,
    category: "quake",
    magnitude: "M 4.8 · 32 km",
    updated: "há 1 h",
    detectedMinutesAgo: 68,
    severity: "moderate",
    region: "americas",
    priority: 2,
  },
  {
    id: "ocean-agu",
    title: "Anomalia térmica oceânica",
    place: "Corrente das Agulhas",
    lat: -34.2,
    lng: 26.8,
    category: "ocean",
    magnitude: "+1,8 °C",
    updated: "há 46 min",
    detectedMinutesAgo: 46,
    severity: "moderate",
    region: "oceans",
    priority: 3,
  },
  {
    id: "ocean-pac-swell",
    title: "Ondulação intensa",
    place: "Pacífico Norte",
    lat: 38.4,
    lng: -158.2,
    category: "ocean",
    magnitude: "Swell 7,4 m",
    updated: "há 4 h",
    detectedMinutesAgo: 240,
    severity: "low",
    region: "oceans",
    priority: 3,
  },
  {
    id: "atm-sahara",
    title: "Pluma de poeira",
    place: "Saara Ocidental",
    lat: 24.1,
    lng: -8.6,
    category: "atmosphere",
    magnitude: "AOD 0,92",
    updated: "há 2 h",
    detectedMinutesAgo: 120,
    severity: "moderate",
    region: "africa",
    priority: 3,
  },
  {
    id: "atm-delhi",
    title: "Índice de aerossóis elevado",
    place: "Planície Indo-Gangética",
    lat: 28.6,
    lng: 77.2,
    category: "atmosphere",
    magnitude: "AOD 1,24",
    updated: "há 9 h",
    detectedMinutesAgo: 540,
    severity: "low",
    region: "asia",
    priority: 3,
  },
  {
    id: "storm-bengal",
    title: "Depressão tropical",
    place: "Golfo de Bengala",
    lat: 15.2,
    lng: 88.7,
    category: "storm",
    magnitude: "Cat. 1 · 120 km/h",
    updated: "há 5 h",
    detectedMinutesAgo: 300,
    severity: "moderate",
    region: "asia",
    priority: 3,
  },
  {
    id: "fire-ca",
    title: "Incêndio florestal",
    place: "Califórnia, EUA",
    lat: 38.9,
    lng: -121.1,
    category: "fire",
    magnitude: "FRP 210 MW",
    updated: "há 2 d",
    detectedMinutesAgo: 60 * 48,
    severity: "high",
    region: "americas",
    priority: 2,
  },
  {
    id: "quake-japan",
    title: "Terremoto M4.4",
    place: "Honshu, Japão",
    lat: 36.2,
    lng: 140.1,
    category: "quake",
    magnitude: "M 4.4 · 55 km",
    updated: "há 9 d",
    detectedMinutesAgo: 60 * 24 * 9,
    severity: "low",
    region: "asia",
    priority: 3,
  },
];
