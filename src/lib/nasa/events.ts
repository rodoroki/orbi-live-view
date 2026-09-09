/**
 * ORBI — camada NASA.
 *
 * Isola a NASA EONET do resto do sistema: o selector só conhece
 * `NaturalEvent[]`, nunca o formato da API. Se a NASA estiver indisponível,
 * a lista chega vazia e a inteligência apenas degrada.
 */
import { useQuery } from "@tanstack/react-query";

import { getEonetEvents } from "@/lib/eonet.functions";

export type NaturalEvent = {
  id: string;
  title: string;
  /** categoria já normalizada pela taxonomia ORBI (fire, weather, geology…) */
  category: string;
  severity: string | null;
  lat: number;
  lng: number;
  updatedAt: string;
};

/** Eventos naturais reais, no formato mínimo que a avaliação de cena precisa. */
export function useNaturalEvents() {
  return useQuery({
    queryKey: ["orbi-natural-events"],
    queryFn: async (): Promise<NaturalEvent[]> => {
      try {
        const { events } = await getEonetEvents({
          data: { days: 10, limit: 200, status: "open" },
        });
        return events
          .map((e) => {
            const loc = (e as { location?: { latitude?: number; longitude?: number } }).location;
            if (typeof loc?.latitude !== "number" || typeof loc?.longitude !== "number") return null;
            return {
              id: e.id,
              title: e.title,
              category: String((e as { category?: string }).category ?? "natural-events"),
              severity: ((e as { severity?: string }).severity ?? null) as string | null,
              lat: loc.latitude,
              lng: loc.longitude,
              updatedAt: String((e as { updatedAt?: string }).updatedAt ?? ""),
            } satisfies NaturalEvent;
          })
          .filter((e): e is NaturalEvent => e !== null);
      } catch {
        return [];
      }
    },
    staleTime: 15 * 60_000,
    retry: 1,
  });
}

/** Distância aproximada em quilômetros (haversine). */
export function distanceKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Evento natural mais próximo de um ponto, dentro de um raio. */
export function nearestEvent(
  events: NaturalEvent[],
  lat: number,
  lng: number,
  maxKm: number,
): { event: NaturalEvent; km: number } | null {
  let best: { event: NaturalEvent; km: number } | null = null;
  for (const event of events) {
    const km = distanceKm(lat, lng, event.lat, event.lng);
    if (km <= maxKm && (!best || km < best.km)) best = { event, km };
  }
  return best;
}
