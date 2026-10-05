import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * ORBI — Satélites e Espaço.
 * - Elementos orbitais: CelesTrak GP (dados públicos do 18th Space Defense Squadron / US Space Force).
 *   A NASA não oferece API pública de posição orbital em tempo real; a posição é calculada (SGP4)
 *   a partir destes elementos, nunca simulada.
 * - Conteúdo espacial: NASA Image and Video Library (images-api.nasa.gov), sem chave.
 */

export type OrbitalElements = {
  OBJECT_NAME: string;
  OBJECT_ID: string;
  NORAD_CAT_ID: number;
  EPOCH: string;
  MEAN_MOTION: number;
  ECCENTRICITY: number;
  INCLINATION: number;
  RA_OF_ASC_NODE: number;
  ARG_OF_PERICENTER: number;
  MEAN_ANOMALY: number;
  BSTAR: number;
  MEAN_MOTION_DOT: number;
  MEAN_MOTION_DDOT: number;
  EPHEMERIS_TYPE: number;
  CLASSIFICATION_TYPE: string;
  ELEMENT_SET_NO: number;
  REV_AT_EPOCH: number;
};

/** Objetos conhecidos e explicáveis — evita listar milhares de fragmentos. */
const NOTABLE = new Set([
  25544, // ISS
  48274, // Tiangong (CSS Tianhe)
  20580, // Hubble
  25994, // Terra
  27424, // Aqua
  25867, // Chandra
  28485, // Swift
  36395, // SDO
  33053, // Fermi
  38358, // NuSTAR
  39197, // IRIS
  43013, // NOAA-20
  37849, // Suomi NPP
  39084, // Landsat 8
  49260, // Landsat 9
]);

const ElementsSchema = z.array(
  z
    .object({
      OBJECT_NAME: z.string(),
      NORAD_CAT_ID: z.number(),
      EPOCH: z.string(),
      MEAN_MOTION: z.number(),
    })
    .passthrough(),
);

let cache: { at: number; data: OrbitalElements[] } | null = null;
const CACHE_MS = 2 * 60 * 60_000; // CelesTrak atualiza a cada poucas horas; pede no máx. 1 req/2h por grupo.

async function fetchGroup(group: string): Promise<OrbitalElements[]> {
  const res = await fetch(
    `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=json`,
    { headers: { "User-Agent": "ORBI LIVE (orbiliveworld.com)" } },
  );
  if (!res.ok) throw new Error(`CelesTrak ${res.status}`);
  return ElementsSchema.parse(await res.json()) as unknown as OrbitalElements[];
}

export const getOrbitalElements = createServerFn({ method: "GET" }).handler(async () => {
  if (cache && Date.now() - cache.at < CACHE_MS)
    return { satellites: cache.data, fetchedAt: cache.at, error: null as string | null };
  try {
    const groups = await Promise.allSettled(
      ["stations", "science", "weather", "resource"].map(fetchGroup),
    );
    const all = groups.flatMap((g) => (g.status === "fulfilled" ? g.value : []));
    const seen = new Set<number>();
    const satellites = all.filter(
      (s) => NOTABLE.has(s.NORAD_CAT_ID) && !seen.has(s.NORAD_CAT_ID) && seen.add(s.NORAD_CAT_ID),
    );
    if (satellites.length === 0) throw new Error("empty");
    cache = { at: Date.now(), data: satellites };
    return { satellites, fetchedAt: cache.at, error: null as string | null };
  } catch (e) {
    if (cache) return { satellites: cache.data, fetchedAt: cache.at, error: null as string | null };
    return { satellites: [] as OrbitalElements[], fetchedAt: Date.now(), error: String(e) };
  }
});

export type NasaMedia = {
  nasaId: string;
  title: string;
  description: string;
  dateCreated: string;
  center: string | null;
  image: string;
};

export const SPACE_TOPICS = [
  "james webb",
  "hubble",
  "nebula",
  "galaxy",
  "jupiter",
  "saturn",
  "mars surface",
  "solar flare",
  "moon",
  "international space station",
] as const;

export const getNasaMedia = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ topic: z.enum(SPACE_TOPICS) }).parse(data))
  .handler(async ({ data }) => {
    try {
      const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(data.topic)}&media_type=image&page_size=12`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`NASA ${res.status}`);
      const json = (await res.json()) as {
        collection?: {
          items?: {
            data?: {
              nasa_id?: string;
              title?: string;
              description?: string;
              date_created?: string;
              center?: string;
            }[];
            links?: { href?: string; render?: string }[];
          }[];
        };
      };
      const items: NasaMedia[] = (json.collection?.items ?? [])
        .map((item) => {
          const d = item.data?.[0];
          const image =
            item.links?.find((l) => l.render === "image")?.href ?? item.links?.[0]?.href;
          if (!d?.nasa_id || !d.title || !image?.startsWith("https://")) return null;
          return {
            nasaId: d.nasa_id,
            title: d.title,
            description: (d.description ?? "").replace(/<[^>]+>/g, "").slice(0, 600),
            dateCreated: d.date_created ?? "",
            center: d.center ?? null,
            image,
          };
        })
        .filter((x): x is NasaMedia => x !== null);
      return { items, error: null as string | null };
    } catch (e) {
      return { items: [] as NasaMedia[], error: String(e) };
    }
  });
