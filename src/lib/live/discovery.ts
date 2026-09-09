/**
 * ORBI LIVE — Discovery.
 *
 * Descobre candidatos: quais pontos do planeta consultar e quais webcams
 * reais a fonte devolve para eles. Não avalia nem escolhe nada.
 *
 * A escolha de ONDE procurar vive em `planetary.ts`; aqui só executamos a
 * janela ativa, sempre pequena, sempre com o cache existente do React Query.
 */
import { useCallback, useEffect, useMemo } from "react";
import { queryOptions, useQueries, useQueryClient } from "@tanstack/react-query";

import { getWindyWebcams, type WindyWebcam } from "@/lib/windy.functions";
import {
  MAX_ACTIVE_DISCOVERY_REGIONS,
  PLANETARY_REGIONS,
  planetaryWindow,
  recordRegionResult,
  type PlanetaryRegion,
} from "./planetary";

/** Uma região de descoberta é um ponto do universo planetário. */
export type DiscoveryRegion = PlanetaryRegion;

/** Universo de descoberta (mantido como nome estável para o selector). */
export const DISCOVERY_REGIONS: readonly DiscoveryRegion[] = PLANETARY_REGIONS;

/** Quantas regiões ficam ativas ao mesmo tempo (controla nº de requisições). */
export const DISCOVERY_WINDOW = MAX_ACTIVE_DISCOVERY_REGIONS;

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
export function regionWindow(
  offset: number,
  size = DISCOVERY_WINDOW,
  eventPoints?: ReadonlyArray<{ lat: number; lng: number }>,
): DiscoveryRegion[] {
  return planetaryWindow(offset, size, eventPoints ? { eventPoints } : {});
}

/**
 * Consulta as regiões da janela atual e devolve o pool de candidatos brutos.
 * Uma query por região, com cache — nenhuma chamada extra por render.
 */
export function useWebcamDiscovery(
  offset: number,
  eventPoints?: ReadonlyArray<{ lat: number; lng: number }>,
) {
  const queryClient = useQueryClient();
  const eventKey = useMemo(
    () =>
      (eventPoints ?? [])
        .slice(0, 24)
        .map((p) => `${p.lat.toFixed(1)},${p.lng.toFixed(1)}`)
        .join("|"),
    [eventPoints],
  );

  const regions = useMemo(
    () => regionWindow(offset, DISCOVERY_WINDOW, eventPoints),
    // a janela só é recalculada quando o offset gira ou os eventos mudam
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [offset, eventKey],
  );

  const results = useQueries({
    queries: regions.map(webcamQueryOptions),
  });

  const webcams: DiscoveredWebcam[] = [];
  results.forEach((result, index) => {
    const region = regions[index]!;
    for (const cam of result.data ?? []) webcams.push({ ...cam, origin: region });
  });

  // Region health: aprende, em runtime, quais regiões valem novos requests.
  const healthKey = results.map((r) => (r.isPending ? "…" : (r.data?.length ?? -1))).join(",");
  useEffect(() => {
    results.forEach((result, index) => {
      const region = regions[index];
      if (!region || result.isPending) return;
      const count = result.data?.length ?? 0;
      recordRegionResult(region.id, { count, failed: result.isError });
      if (import.meta.env.DEV) {
        console.debug(
          count > 0
            ? `[ORBI DISCOVERY] webcams found: ${region.id} → ${count}`
            : `[ORBI DISCOVERY] region empty: ${region.id}`,
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [healthKey]);

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
