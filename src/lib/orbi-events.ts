export type EventCategory =
  | "fire"
  | "storm"
  | "volcano"
  | "quake"
  | "ocean"
  | "atmosphere";

export type OrbiEvent = {
  id: string;
  title: string;
  place: string;
  lat: number;
  lng: number;
  category: EventCategory;
  magnitude: string;
  updated: string;
  priority: 1 | 2 | 3;
};

export const CATEGORY_META: Record<
  EventCategory,
  { label: string; glyph: string; color: string }
> = {
  fire: { label: "Incêndios", glyph: "🔥", color: "oklch(0.72 0.13 55)" },
  storm: { label: "Tempestades", glyph: "🌪", color: "oklch(0.74 0.08 250)" },
  volcano: { label: "Vulcões", glyph: "🌋", color: "oklch(0.66 0.14 30)" },
  quake: { label: "Terremotos", glyph: "🌎", color: "oklch(0.78 0.10 95)" },
  ocean: { label: "Oceanos", glyph: "🌊", color: "oklch(0.74 0.10 205)" },
  atmosphere: { label: "Atmosféricos", glyph: "☁", color: "oklch(0.80 0.03 220)" },
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
    priority: 2,
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
    priority: 3,
  },
];
