import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Integração Windy — Point Forecast API v2.
 * Retorna previsão pontual (tempo, vento, pressão...) para coordenadas.
 * Documentação: https://api.windy.com/point-forecast/docs
 */
export const getWindyPointForecast = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env["WINDY_POINT_FORECAST_API_KEY"];
    if (!apiKey) throw new Error("WINDY_POINT_FORECAST_API_KEY missing");

    const res = await fetch("https://api.windy.com/api/point-forecast/v2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat: data.lat,
        lon: data.lng,
        model: "gfs",
        parameters: ["temp", "wind", "rh", "pressure", "lclouds", "mclouds", "hclouds", "gust", "ptype"],
        levels: ["surface"],
        key: apiKey,
      }),
    });

    if (!res.ok) throw new Error(`Windy forecast failed: ${res.status}`);
    const json = (await res.json()) as Record<string, unknown>;
    return json;
  });

/**
 * Integração Windy — Webcams API v2.
 * Lista webcams próximas de uma coordenada.
 * Documentação: https://api.windy.com/webcams/docs
 */
export const getWindyWebcams = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        radiusKm: z.number().min(10).max(250).default(100),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env["WINDY_WEBCAMS_API_KEY"];
    if (!apiKey) throw new Error("WINDY_WEBCAMS_API_KEY missing");

    const res = await fetch(
      `https://api.windy.com/api/webcams/v2/list/nearby=${data.lat},${data.lng},${data.radiusKm}?key=${apiKey}`,
    );

    if (!res.ok) throw new Error(`Windy webcams failed: ${res.status}`);
    return (await res.json()) as Record<string, unknown>;
  });
