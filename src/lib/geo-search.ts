import { useQuery } from "@tanstack/react-query";

/**
 * Busca de regiões (continente, país, estado, cidade).
 * Fonte: Open-Meteo Geocoding API (aberta, sem chave).
 */

export type GeoPlace = {
  id: string;
  name: string;
  /** "Cidade · Estado · País" */
  detail: string;
  lat: number;
  lng: number;
  kind: "city" | "region" | "country" | "continent";
};

const CONTINENTS: GeoPlace[] = [
  { id: "c-africa", name: "África", detail: "Continente", lat: 2, lng: 20, kind: "continent" },
  { id: "c-america-s", name: "América do Sul", detail: "Continente", lat: -14, lng: -58, kind: "continent" },
  { id: "c-america-n", name: "América do Norte", detail: "Continente", lat: 45, lng: -100, kind: "continent" },
  { id: "c-europe", name: "Europa", detail: "Continente", lat: 50, lng: 12, kind: "continent" },
  { id: "c-asia", name: "Ásia", detail: "Continente", lat: 34, lng: 90, kind: "continent" },
  { id: "c-oceania", name: "Oceania", detail: "Continente", lat: -25, lng: 140, kind: "continent" },
  { id: "c-antarctica", name: "Antártica", detail: "Continente", lat: -80, lng: 0, kind: "continent" },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

type OpenMeteoResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  feature_code?: string;
};

export async function searchPlaces(query: string, language: string): Promise<GeoPlace[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const local = CONTINENTS.filter((c) => normalize(c.name).includes(normalize(q)));

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    q,
  )}&count=8&language=${language.slice(0, 2)}&format=json`;

  let remote: GeoPlace[] = [];
  try {
    const res = await fetch(url);
    if (res.ok) {
      const json = (await res.json()) as { results?: OpenMeteoResult[] };
      remote = (json.results ?? []).map((r) => ({
        id: String(r.id),
        name: r.name,
        detail: [r.admin1, r.country].filter(Boolean).join(" · "),
        lat: r.latitude,
        lng: r.longitude,
        kind: r.feature_code?.startsWith("PCL")
          ? ("country" as const)
          : r.feature_code?.startsWith("ADM1")
            ? ("region" as const)
            : ("city" as const),
      }));
    }
  } catch {
    remote = [];
  }

  return [...local, ...remote];
}

export function usePlaceSearch(query: string, language: string) {
  return useQuery({
    queryKey: ["geo-search", query, language],
    queryFn: () => searchPlaces(query, language),
    enabled: query.trim().length >= 2,
    staleTime: 5 * 60_000,
  });
}
