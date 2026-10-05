import { useQuery } from "@tanstack/react-query";
import { eciToGeodetic, gstime, json2satrec, propagate, degreesLat, degreesLong } from "satellite.js";
import { getOrbitalElements, type OrbitalElements } from "@/lib/space.functions";

export type SatPosition = {
  lat: number;
  lng: number;
  altitudeKm: number;
  velocityKms: number;
  at: Date;
};

/** Elementos orbitais reais (CelesTrak), cache longo para respeitar a fonte. */
export function useSatellites(enabled = true) {
  return useQuery({
    queryKey: ["orbital-elements"],
    queryFn: async () => {
      const res = await getOrbitalElements();
      if (res.error) throw new Error(res.error);
      return res;
    },
    enabled,
    staleTime: 2 * 60 * 60_000,
    gcTime: 4 * 60 * 60_000,
    retry: 1,
  });
}

/** Posição calculada (SGP4) a partir dos elementos — nunca simulada. */
export function positionAt(sat: OrbitalElements, at: Date): SatPosition | null {
  try {
    const rec = json2satrec(sat as unknown as Parameters<typeof json2satrec>[0]);
    const pv = propagate(rec, at);
    if (!pv || typeof pv.position === "boolean" || !pv.position) return null;
    const geo = eciToGeodetic(pv.position, gstime(at));
    const v = pv.velocity && typeof pv.velocity !== "boolean" ? pv.velocity : null;
    const lat = degreesLat(geo.latitude);
    const lng = degreesLong(geo.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return {
      lat,
      lng,
      altitudeKm: geo.height,
      velocityKms: v ? Math.hypot(v.x, v.y, v.z) : 0,
      at,
    };
  } catch {
    return null;
  }
}

/** Traço no solo ±minutes em torno de agora, para desenhar a órbita no globo. */
export function groundTrack(sat: OrbitalElements, at: Date, minutes = 45, stepMin = 1.5) {
  const pts: { lat: number; lng: number }[] = [];
  for (let m = -minutes; m <= minutes; m += stepMin) {
    const p = positionAt(sat, new Date(at.getTime() + m * 60_000));
    if (p) pts.push({ lat: p.lat, lng: p.lng });
  }
  return pts;
}

/** Idade dos elementos orbitais em horas — exibida para transparência. */
export function epochAgeHours(sat: OrbitalElements, now: Date) {
  const epoch = Date.parse(sat.EPOCH.endsWith("Z") ? sat.EPOCH : `${sat.EPOCH}Z`);
  return Math.max(0, Math.round((now.getTime() - epoch) / 3_600_000));
}
