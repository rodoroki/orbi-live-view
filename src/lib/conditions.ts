/**
 * Dados ambientais fictícios — camada preparada para futuras fontes
 * (Windy, NOAA, Copernicus). Nenhuma integração real nesta etapa.
 */

export type MetricKey =
  | "temperature"
  | "wind"
  | "gusts"
  | "precipitation"
  | "pressure"
  | "humidity"
  | "cloud"
  | "cape"
  | "waves"
  | "swell"
  | "seaWind"
  | "currents";

export type Metric = {
  key: MetricKey;
  value: string;
  /** 0–1 — usado pela barra/sparkline discreta */
  ratio: number;
  /** série curta (-48h → +48h) para leitura de tendência */
  series: number[];
};

const series = (seed: number, spread = 0.35): number[] =>
  Array.from({ length: 17 }, (_, i) => {
    const wave = Math.sin(seed + i * 0.55) * spread + Math.cos(seed * 1.7 + i * 0.21) * (spread / 2);
    return Math.min(1, Math.max(0.05, 0.5 + wave));
  });

export const ATMOSPHERE_METRICS: Metric[] = [
  { key: "temperature", value: "14,2 °C", ratio: 0.52, series: series(1.1) },
  { key: "wind", value: "18 kt", ratio: 0.44, series: series(2.4) },
  { key: "gusts", value: "31 kt", ratio: 0.68, series: series(3.2, 0.42) },
  { key: "precipitation", value: "2,4 mm/h", ratio: 0.31, series: series(4.6, 0.3) },
  { key: "pressure", value: "1013 hPa", ratio: 0.57, series: series(5.1, 0.18) },
  { key: "humidity", value: "62 %", ratio: 0.62, series: series(6.3, 0.22) },
  { key: "cloud", value: "48 %", ratio: 0.48, series: series(7.7, 0.28) },
  { key: "cape", value: "1 240 J/kg", ratio: 0.74, series: series(8.9, 0.4) },
];

export const OCEAN_METRICS: Metric[] = [
  { key: "waves", value: "2,4 m", ratio: 0.55, series: series(11.2, 0.3) },
  { key: "swell", value: "1,8 m · 11 s", ratio: 0.42, series: series(12.5, 0.26) },
  { key: "seaWind", value: "22 kt SW", ratio: 0.6, series: series(13.8, 0.34) },
  { key: "currents", value: "0,8 kt NE", ratio: 0.28, series: series(14.4, 0.2) },
];

/** Camadas meteorológicas previstas para o futuro provedor de mapas. */
export const WEATHER_LAYERS: MetricKey[] = [
  "wind",
  "temperature",
  "precipitation",
  "pressure",
  "waves",
  "swell",
];
