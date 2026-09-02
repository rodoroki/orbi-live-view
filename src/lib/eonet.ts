import { useQuery } from "@tanstack/react-query";
import { getEonetEvents } from "@/lib/eonet.functions";
import { toLegacyEvents } from "@/lib/data/adapters/legacy-view-adapter";

export { getEonetEvents };

/**
 * Eventos reais da NASA EONET, já convertidos para o formato consumido
 * hoje pelo globo, mapa e painel de eventos.
 */
export function useEonetEvents(options?: { days?: number; limit?: number }) {
  return useQuery({
    queryKey: ["eonet-events", options?.days ?? 15, options?.limit ?? 200],
    queryFn: async () => {
      const { events, error } = await getEonetEvents({
        data: { days: options?.days ?? 15, limit: options?.limit ?? 200, status: "open" },
      });
      if (error || events.length === 0) return null;
      return toLegacyEvents(events);
    },
    staleTime: 10 * 60_000,
    retry: 1,
  });
}
