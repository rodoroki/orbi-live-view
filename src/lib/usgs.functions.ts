import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  USGS_API,
  usgsResponseToOrbiEvents,
  type UsgsResponse,
} from "@/lib/data/adapters/usgs";
import type { SerializableOrbiEvent } from "@/lib/data/adapters/eonet";

/**
 * USGS FDSN Event — https://earthquake.usgs.gov/fdsnws/event/1/
 * API pública, sem chave. Fetch no servidor: evita CORS e centraliza cache.
 */
export const getUsgsEarthquakes = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z
      .object({
        days: z.number().min(1).max(30).default(2),
        minMagnitude: z.number().min(0).max(10).default(2.5),
        limit: z.number().min(1).max(500).default(200),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data }): Promise<{ events: SerializableOrbiEvent[]; error: string | null }> => {
    const start = new Date(Date.now() - data.days * 24 * 60 * 60_000).toISOString();
    const params = new URLSearchParams({
      format: "geojson",
      starttime: start,
      minmagnitude: String(data.minMagnitude),
      limit: String(data.limit),
      orderby: "time",
    });

    try {
      const res = await fetch(`${USGS_API}?${params.toString()}`, {
        headers: { Accept: "application/geo+json" },
      });
      if (!res.ok) return { events: [], error: `USGS request failed (${res.status})` };
      const json = (await res.json()) as UsgsResponse;
      return { events: usgsResponseToOrbiEvents(json), error: null };
    } catch {
      return { events: [], error: "USGS unavailable" };
    }
  });
