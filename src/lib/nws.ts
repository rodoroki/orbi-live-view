import { useQuery } from "@tanstack/react-query";
import { getNwsAlerts } from "@/lib/nws.functions";
import { toLegacyEvents } from "@/lib/data/adapters/legacy-view-adapter";

export { getNwsAlerts };

/** Alertas meteorológicos ativos do NOAA/NWS (EUA). */
export function useNwsAlerts(options?: {
  limit?: number;
  severity?: "all" | "extreme" | "severe" | "moderate";
}) {
  return useQuery({
    queryKey: ["nws-alerts", options?.limit ?? 150, options?.severity ?? "severe"],
    queryFn: async () => {
      const { events, error } = await getNwsAlerts({
        data: { limit: options?.limit ?? 150, severity: options?.severity ?? "severe" },
      });
      if (error || events.length === 0) return null;
      return toLegacyEvents(events);
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
