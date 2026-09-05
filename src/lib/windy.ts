import { useQuery } from "@tanstack/react-query";
import { getWindyPointForecast, getWindyWebcams } from "@/lib/windy.functions";

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

/** Câmeras ao vivo próximas das coordenadas informadas. */
export function useWindyWebcams(lat: number | null, lng: number | null) {
  return useQuery({
    queryKey: ["windy-webcams", lat, lng],
    queryFn: async () => {
      const { webcams } = await getWindyWebcams({
        data: { lat: lat!, lng: lng!, radiusKm: 250 },
      });
      return webcams;
    },
    enabled: lat != null && lng != null,
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

