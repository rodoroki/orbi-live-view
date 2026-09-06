import { useQuery } from "@tanstack/react-query";
import { getUsgsEarthquakes } from "@/lib/usgs.functions";
import { toLegacyEvents } from "@/lib/data/adapters/legacy-view-adapter";

export { getUsgsEarthquakes };

/** Terremotos reais do USGS, já no formato consumido pelo globo e mapa. */
export function useUsgsEarthquakes(options?: {
  days?: number;
  minMagnitude?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [
      "usgs-earthquakes",
      options?.days ?? 2,
      options?.minMagnitude ?? 2.5,
      options?.limit ?? 200,
    ],
    queryFn: async () => {
      const { events, error } = await getUsgsEarthquakes({
        data: {
          days: options?.days ?? 2,
          minMagnitude: options?.minMagnitude ?? 2.5,
          limit: options?.limit ?? 200,
        },
      });
      if (error || events.length === 0) return null;
      return toLegacyEvents(events);
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
