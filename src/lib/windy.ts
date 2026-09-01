import { useQuery } from "@tanstack/react-query";
import { getWindyPointForecast } from "@/lib/windy.functions";

export type { WindyWebcam } from "@/lib/windy.functions";
export { getWindyPointForecast, getWindyWebcams } from "@/lib/windy.functions";

/** Busca previsão pontual do Windy para as coordenadas informadas. */
export function useWindyForecast(lat: number | null, lng: number | null) {
  return useQuery({
    queryKey: ["windy-forecast", lat, lng],
    queryFn: async () => {
      const { metrics } = await getWindyPointForecast({
        data: { lat: lat!, lng: lng! },
      });
      return metrics.length > 0 ? metrics : null;
    },
    enabled: lat != null && lng != null,
    staleTime: 10 * 60_000,
    retry: 1,
  });
}
