import { useQuery } from "@tanstack/react-query";
import { getWindyPointForecast } from "@/lib/windy.functions";
import type { Metric, MetricKey } from "@/lib/conditions";

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
 * Retorna null quando a resposta não traz dados utilizáveis.
 */
export function mapWindyToMetrics(json: WindyResponse): Metric[] | null {
  const temp = pick(json["temp-surface"]);
  const windU = pick(json["wind_u-surface"]);
  const windV = pick(json["wind_v-surface"]);
  if (temp == null && windU == null) return null;

  const metrics: Metric[] = [];

  if (temp != null) {
    const celsius = temp - 273.15;
    metrics.push(
      makeMetric("temperature", `${celsius.toFixed(1).replace(".", ",")} °C`, toSeries(json["temp-surface"])),
    );
  }
  if (windU != null && windV != null) {
    const speedMs = Math.hypot(windU, windV);
    metrics.push(
      makeMetric(
        "wind",
        `${Math.round(speedMs * MS_TO_KNOTS)} kt`,
        toSeries(
          json["wind_u-surface"]?.map((u, i) => Math.hypot(u, json["wind_v-surface"]?.[i] ?? 0)),
        ),
      ),
    );
  }
  const gust = pick(json["gust-surface"]);
  if (gust != null) {
    metrics.push(
      makeMetric("gusts", `${Math.round(gust * MS_TO_KNOTS)} kt`, toSeries(json["gust-surface"])),
    );
  }
  const pressure = pick(json["pressure-surface"]);
  if (pressure != null) {
    metrics.push(
      makeMetric("pressure", `${Math.round(pressure / 100)} hPa`, toSeries(json["pressure-surface"])),
    );
  }
  const rh = pick(json["rh-surface"]);
  if (rh != null) {
    metrics.push(makeMetric("humidity", `${Math.round(rh)} %`, toSeries(json["rh-surface"])));
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

  return metrics.length > 0 ? metrics : null;
}

/** Busca previsão pontual do Windy para as coordenadas informadas. */
export function useWindyForecast(lat: number | null, lng: number | null) {
  return useQuery({
    queryKey: ["windy-forecast", lat, lng],
    queryFn: async () => {
      const json = (await getWindyPointForecast({
        data: { lat: lat!, lng: lng! },
      })) as WindyResponse;
      return mapWindyToMetrics(json);
    },
    enabled: lat != null && lng != null,
    staleTime: 10 * 60_000,
    retry: 1,
  });
}
