import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  NWS_API,
  nwsAlertsToOrbiEvents,
  type NwsAlertsResponse,
} from "@/lib/data/adapters/nws";
import type { SerializableOrbiEvent } from "@/lib/data/adapters/eonet";

/**
 * NOAA / National Weather Service — https://api.weather.gov/
 * API pública, sem chave (exige User-Agent). Fetch no servidor.
 */
export const getNwsAlerts = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z
      .object({
        limit: z.number().min(1).max(500).default(150),
        severity: z
          .enum(["all", "extreme", "severe", "moderate"])
          .default("severe"),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data }): Promise<{ events: SerializableOrbiEvent[]; error: string | null }> => {
    const params = new URLSearchParams({
      status: "actual",
      limit: String(data.limit),
    });
    if (data.severity === "severe") params.append("severity", "Extreme"), params.append("severity", "Severe");
    if (data.severity === "extreme") params.append("severity", "Extreme");
    if (data.severity === "moderate") params.append("severity", "Moderate");

    try {
      const res = await fetch(`${NWS_API}/alerts/active?${params.toString()}`, {
        headers: {
          Accept: "application/geo+json",
          "User-Agent": "ORBI LIVE (contact via lovable.app)",
        },
      });
      if (!res.ok) return { events: [], error: `NWS request failed (${res.status})` };
      const json = (await res.json()) as NwsAlertsResponse;
      return { events: nwsAlertsToOrbiEvents(json), error: null };
    } catch {
      return { events: [], error: "NWS unavailable" };
    }
  });
