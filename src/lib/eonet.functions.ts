import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  EONET_API,
  eonetResponseToOrbiEvents,
  type EonetResponse,
} from "@/lib/data/adapters/eonet";
import type { OrbiEvent } from "@/lib/schemas";

/**
 * NASA EONET v3 — https://eonet.gsfc.nasa.gov/docs/v3
 * API pública, sem chave. O fetch fica no servidor para evitar CORS,
 * centralizar cache e permitir troca de fonte sem tocar na UI.
 */
export const getEonetEvents = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z
      .object({
        /** dias retroativos (EONET: days) */
        days: z.number().min(1).max(60).default(15),
        limit: z.number().min(1).max(500).default(200),
        status: z.enum(["open", "closed", "all"]).default("open"),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data }): Promise<{ events: OrbiEvent[]; error: string | null }> => {
    const params = new URLSearchParams({
      days: String(data.days),
      limit: String(data.limit),
    });
    if (data.status !== "all") params.set("status", data.status);

    try {
      const res = await fetch(`${EONET_API}?${params.toString()}`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        return { events: [], error: `EONET request failed (${res.status})` };
      }
      const json = (await res.json()) as EonetResponse;
      return { events: eonetResponseToOrbiEvents(json), error: null };
    } catch {
      return { events: [], error: "EONET unavailable" };
    }
  });
