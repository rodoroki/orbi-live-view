/**
 * ORBI LIVE — Discovery.
 *
 * Descobre candidatos: quais pontos do planeta consultar e quais webcams
 * reais a fonte devolve para eles. Não avalia nem escolhe nada.
 *
 * Performance: o catálogo é grande, mas só uma janela pequena de regiões é
 * consultada por vez, e cada consulta usa o cache existente do React Query.
 */
import { useCallback, useMemo } from "react";
import { queryOptions, useQueries, useQueryClient } from "@tanstack/react-query";

import { getWindyWebcams, type WindyWebcam } from "@/lib/windy.functions";

export type DiscoveryRegion = {
  id: string;
  lat: number;
  lng: number;
  /** agrupamento macro usado pela diversidade geográfica */
  continent: string;
};

/** Catálogo de pontos de observação — coordenadas de consulta, não conteúdo. */
export const DISCOVERY_REGIONS: readonly DiscoveryRegion[] = [
  { id: "balneario-camboriu", lat: -26.99, lng: -48.63, continent: "south-america" },
  { id: "rio-de-janeiro", lat: -22.91, lng: -43.18, continent: "south-america" },
  { id: "patagonia", lat: -41.13, lng: -71.31, continent: "south-america" },
  { id: "reykjavik", lat: 64.15, lng: -21.94, continent: "europe" },
  { id: "dolomites", lat: 46.05, lng: 11.12, continent: "europe" },
  { id: "lisbon", lat: 38.72, lng: -9.14, continent: "europe" },
  { id: "canary-islands", lat: 28.29, lng: -16.63, continent: "europe" },
  { id: "tokyo", lat: 35.68, lng: 139.69, continent: "asia" },
  { id: "bangkok", lat: 13.76, lng: 100.5, continent: "asia" },
  { id: "himalaya", lat: 27.99, lng: 86.93, continent: "asia" },
  { id: "new-york", lat: 40.71, lng: -74.01, continent: "north-america" },
  { id: "san-francisco", lat: 37.77, lng: -122.42, continent: "north-america" },
  { id: "rocky-mountains", lat: 50.45, lng: -116.0, continent: "north-america" },
  { id: "sydney", lat: -33.86, lng: 151.21, continent: "oceania" },
  { id: "queenstown", lat: -45.03, lng: 168.66, continent: "oceania" },
  { id: "cape-town", lat: -33.92, lng: 18.42, continent: "africa" },
  { id: "canary-atlas", lat: 31.63, lng: -7.99, continent: "africa" },
];

/** Quantas regiões ficam ativas ao mesmo tempo (controla nº de requisições). */
export const DISCOVERY_WINDOW = 4;

export type DiscoveredWebcam = WindyWebcam & { origin: DiscoveryRegion };

export function webcamQueryOptions(region: DiscoveryRegion) {
  return queryOptions({
    queryKey: ["windy-webcams", region.lat, region.lng],
    queryFn: async () => {
      try {
        const { webcams } = await getWindyWebcams({
          data: { lat: region.lat, lng: region.lng, radiusKm: 250 },
        });
        return webcams;
      } catch {
        return [] as WindyWebcam[];
      }
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

/** Janela deslizante de regiões, a partir de um deslocamento. */
export function regionWindow(offset: number, size = DISCOVERY_WINDOW): DiscoveryRegion[] {
  const total = DISCOVERY_REGIONS.length;
  return Array.from({ length: Math.min(size, total) }, (_, i) => {
    const region = DISCOVERY_REGIONS[(offset + i) % total];
    return region!;
  });
}

/**
 * Consulta as regiões da janela atual e devolve o pool de candidatos brutos.
 * Uma query por região, com cache — nenhuma chamada extra por render.
 */
export function useWebcamDiscovery(offset: number) {
  const queryClient = useQueryClient();
  const regions = useMemo(() => regionWindow(offset), [offset]);

  const results = useQueries({
    queries: regions.map(webcamQueryOptions),
  });

  const webcams: DiscoveredWebcam[] = [];
  results.forEach((result, index) => {
    const region = regions[index]!;
    for (const cam of result.data ?? []) webcams.push({ ...cam, origin: region });
  });

  /** Reconsulta somente a janela ativa, usada pelo backoff quando ela volta vazia. */
  const retryDiscovery = useCallback(async () => {
    await Promise.all(
      regions.map((region) =>
        queryClient.fetchQuery({ ...webcamQueryOptions(region), staleTime: 0 }),
      ),
    );
  }, [queryClient, regions]);

  return {
    webcams,
    isLoading: results.some((r) => r.isLoading) && webcams.length === 0,
    retryDiscovery,
  };
}
