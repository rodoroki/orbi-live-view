import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Metric, MetricKey } from "./conditions";

type WindyResponse = {
  ts?: number[];
  units?: Record<string, string>;
  "temp-surface"?: number[];
  "wind_u-surface"?: number[];
  "wind_v-surface"?: number[];
  "gust-surface"?: number[];
  "pressure-surface"?: number[];
  "rh-surface"?: number[];
  "lclouds-surface"?: number[];
  "mclouds-surface"?: number[];
  "hclouds-surface"?: number[];
  "past3hprecip-surface"?: number[];
};

const MS_TO_KNOTS = 1.94384;

function pick(arr: number[] | undefined): number | null {
  return arr && arr.length > 0 ? arr[0]! : null;
}

/** série normalizada (0–1) a partir dos primeiros N pontos da previsão */
function toSeries(arr: number[] | undefined, points = 17): number[] {
  if (!arr || arr.length === 0) return [];
  const slice = arr.slice(0, points);
  const min = Math.min(...slice);
  const max = Math.max(...slice);
  const range = max - min || 1;
  return slice.map((v) => 0.1 + ((v - min) / range) * 0.85);
}

function makeMetric(key: MetricKey, value: string, series: number[]): Metric {
  return { key, value, ratio: series[0] ?? 0.5, series };
}

/**
 * Converte a resposta da Point Forecast API (modelo GFS, nível surface)
 * nas métricas atmosféricas exibidas pelo painel de condições.
 */
export function mapWindyToMetrics(json: WindyResponse): Metric[] {
  const metrics: Metric[] = [];

  const temp = pick(json["temp-surface"]);
  if (temp != null) {
    const celsius = temp - 273.15;
    metrics.push(
      makeMetric(
        "temperature",
        `${celsius.toFixed(1).replace(".", ",")} °C`,
        toSeries(json["temp-surface"]),
      ),
    );
  }
  const windU = pick(json["wind_u-surface"]);
  const windV = pick(json["wind_v-surface"]);
  if (windU != null && windV != null) {
    const speedMs = Math.hypot(windU, windV);
    metrics.push(
      makeMetric(
        "wind",
        `${Math.round(speedMs * MS_TO_KNOTS)} kt`,
        toSeries(
          json["wind_u-surface"]?.map((u, i) =>
            Math.hypot(u, json["wind_v-surface"]?.[i] ?? 0),
          ),
        ),
      ),
    );
  }
  const gust = pick(json["gust-surface"]);
  if (gust != null) {
    metrics.push(
      makeMetric(
        "gusts",
        `${Math.round(gust * MS_TO_KNOTS)} kt`,
        toSeries(json["gust-surface"]),
      ),
    );
  }
  const pressure = pick(json["pressure-surface"]);
  if (pressure != null) {
    metrics.push(
      makeMetric(
        "pressure",
        `${Math.round(pressure / 100)} hPa`,
        toSeries(json["pressure-surface"]),
      ),
    );
  }
  const precip = pick(json["past3hprecip-surface"]);
  if (precip != null) {
    // metros acumulados em 3 h → mm/h
    const mmPerHour = (precip * 1000) / 3;
    metrics.push(
      makeMetric(
        "precipitation",
        `${mmPerHour.toFixed(1).replace(".", ",")} mm/h`,
        toSeries(json["past3hprecip-surface"]),
      ),
    );
  }
  const rh = pick(json["rh-surface"]);
  if (rh != null) {
    metrics.push(
      makeMetric("humidity", `${Math.round(rh)} %`, toSeries(json["rh-surface"])),
    );
  }
  const clouds = (["lclouds-surface", "mclouds-surface", "hclouds-surface"] as const)
    .map((k) => pick(json[k]))
    .filter((v): v is number => v != null);
  if (clouds.length > 0) {
    const avg = clouds.reduce((a, b) => a + b, 0) / clouds.length;
    metrics.push(
      makeMetric(
        "cloud",
        `${Math.round(avg)} %`,
        toSeries(json["lclouds-surface"] ?? json["mclouds-surface"]),
      ),
    );
  }

  return metrics;
}

export type WindyWebcam = {
  id: string;
  title: string;
  imageUrl: string | null;
  lat: number;
  lng: number;
};

/**
 * Integração Windy — Point Forecast API v2.
 * Retorna métricas atmosféricas já mapeadas para o painel de condições.
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
  .handler(async ({ data }): Promise<{ metrics: Metric[] }> => {
    const apiKey = process.env["WINDY_POINT_FORECAST_API_KEY"];
    if (!apiKey) throw new Error("WINDY_POINT_FORECAST_API_KEY missing");

    const res = await fetch("https://api.windy.com/api/point-forecast/v2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat: data.lat,
        lon: data.lng,
        model: "gfs",
        // "gust" não é suportado pelo modelo GFS na Point Forecast API
        parameters: ["temp", "wind", "rh", "pressure", "precip", "lclouds", "mclouds", "hclouds", "ptype"],
        levels: ["surface"],
        key: apiKey,
      }),
    });

    if (!res.ok) throw new Error(`Windy forecast failed: ${res.status}`);
    const json = (await res.json()) as WindyResponse;
    return { metrics: mapWindyToMetrics(json) };
  });

/**
 * Integração Windy — Webcams API v3.
 * Lista webcams próximas de uma coordenada.
 * Documentação: https://api.windy.com/webcams/docs
 */
export const getWindyWebcams = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        radiusKm: z.number().min(10).max(250).default(150),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<{ webcams: WindyWebcam[] }> => {
    const apiKey = process.env["WINDY_WEBCAMS_API_KEY"];
    if (!apiKey) throw new Error("WINDY_WEBCAMS_API_KEY missing");

    const url =
      `https://api.windy.com/webcams/api/v3/webcams?nearby=${data.lat},${data.lng},${data.radiusKm}` +
      `&limit=12&include=images,location`;

    const res = await fetch(url, { headers: { "x-windy-api-key": apiKey } });
    if (!res.ok) throw new Error(`Windy webcams failed: ${res.status}`);

    const json = (await res.json()) as {
      webcams?: {
        webcamId?: number | string;
        title?: string;
        images?: { current?: { preview?: string; thumbnail?: string } };
        location?: { latitude?: number; longitude?: number; city?: string };
      }[];
    };

    const webcams: WindyWebcam[] = (json.webcams ?? [])
      .map((w) => ({
        id: String(w.webcamId ?? ""),
        title: w.title ?? w.location?.city ?? "Webcam",
        imageUrl: w.images?.current?.preview ?? w.images?.current?.thumbnail ?? null,
        lat: w.location?.latitude ?? data.lat,
        lng: w.location?.longitude ?? data.lng,
      }))
      .filter((w) => w.id !== "");

    return { webcams };
  });

