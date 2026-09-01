import { z } from "zod";
import type { Locale } from "@/lib/i18n";

/**
 * ORBI TAXONOMY — Phenomena
 *
 * Fonte única de verdade para fenômenos. Ver pontos 16 e 18 do plano
 * de continuidade.
 *
 * Estes ids são identificadores internos e devem permanecer estáveis
 * (usados por URLs de SEO, ex.: /en/events/wildfire).
 */

export const PhenomenonSchema = z.object({
  id: z.string(),
  slug: z.string(),
  categoryId: z.string(),
  name: z.record(z.enum(["en", "pt-BR", "es"]), z.string()),
});

export type Phenomenon = z.infer<typeof PhenomenonSchema>;

export const PHENOMENA: Phenomenon[] = [
  { id: "wildfire", slug: "wildfire", categoryId: "fire", name: { en: "Wildfire", "pt-BR": "Incêndio Florestal", es: "Incendio Forestal" } },
  { id: "earthquake", slug: "earthquake", categoryId: "geology", name: { en: "Earthquake", "pt-BR": "Terremoto", es: "Terremoto" } },
  { id: "volcanic-eruption", slug: "volcanic-eruption", categoryId: "geology", name: { en: "Volcanic Eruption", "pt-BR": "Erupção Vulcânica", es: "Erupción Volcánica" } },
  { id: "storm", slug: "storm", categoryId: "weather", name: { en: "Storm", "pt-BR": "Tempestade", es: "Tormenta" } },
  { id: "hurricane", slug: "hurricane", categoryId: "weather", name: { en: "Hurricane", "pt-BR": "Furacão", es: "Huracán" } },
  { id: "tropical-storm", slug: "tropical-storm", categoryId: "weather", name: { en: "Tropical Storm", "pt-BR": "Tempestade Tropical", es: "Tormenta Tropical" } },
  { id: "cyclone", slug: "cyclone", categoryId: "weather", name: { en: "Cyclone", "pt-BR": "Ciclone", es: "Ciclón" } },
  { id: "typhoon", slug: "typhoon", categoryId: "weather", name: { en: "Typhoon", "pt-BR": "Tufão", es: "Tifón" } },
  { id: "flood", slug: "flood", categoryId: "weather", name: { en: "Flood", "pt-BR": "Enchente", es: "Inundación" } },
  { id: "landslide", slug: "landslide", categoryId: "geology", name: { en: "Landslide", "pt-BR": "Deslizamento", es: "Deslizamiento" } },
  { id: "dust-storm", slug: "dust-storm", categoryId: "atmosphere", name: { en: "Dust Storm", "pt-BR": "Tempestade de Poeira", es: "Tormenta de Polvo" } },
  { id: "severe-weather", slug: "severe-weather", categoryId: "weather", name: { en: "Severe Weather", "pt-BR": "Clima Severo", es: "Clima Severo" } },
  { id: "wind", slug: "wind", categoryId: "weather", name: { en: "Wind", "pt-BR": "Vento", es: "Viento" } },
  { id: "rain", slug: "rain", categoryId: "weather", name: { en: "Rain", "pt-BR": "Chuva", es: "Lluvia" } },
  { id: "temperature", slug: "temperature", categoryId: "climate", name: { en: "Temperature", "pt-BR": "Temperatura", es: "Temperatura" } },
  { id: "humidity", slug: "humidity", categoryId: "atmosphere", name: { en: "Humidity", "pt-BR": "Umidade", es: "Humedad" } },
  { id: "pressure", slug: "pressure", categoryId: "atmosphere", name: { en: "Pressure", "pt-BR": "Pressão", es: "Presión" } },
  { id: "clouds", slug: "clouds", categoryId: "atmosphere", name: { en: "Clouds", "pt-BR": "Nuvens", es: "Nubes" } },
  { id: "precipitation", slug: "precipitation", categoryId: "weather", name: { en: "Precipitation", "pt-BR": "Precipitação", es: "Precipitación" } },
  { id: "ocean-current", slug: "ocean-current", categoryId: "ocean", name: { en: "Ocean Current", "pt-BR": "Corrente Oceânica", es: "Corriente Oceánica" } },
  { id: "wave", slug: "wave", categoryId: "ocean", name: { en: "Wave", "pt-BR": "Onda", es: "Ola" } },
  { id: "swell", slug: "swell", categoryId: "ocean", name: { en: "Swell", "pt-BR": "Ondulação", es: "Oleaje" } },
  { id: "sea-surface-temperature", slug: "sea-surface-temperature", categoryId: "ocean", name: { en: "Sea Surface Temperature", "pt-BR": "Temperatura da Superfície do Mar", es: "Temperatura Superficial del Mar" } },
  { id: "el-nino", slug: "el-nino", categoryId: "climate", name: { en: "El Niño", "pt-BR": "El Niño", es: "El Niño" } },
  { id: "la-nina", slug: "la-nina", categoryId: "climate", name: { en: "La Niña", "pt-BR": "La Niña", es: "La Niña" } },
  { id: "climate-event", slug: "climate-event", categoryId: "climate", name: { en: "Climate Event", "pt-BR": "Evento Climático", es: "Evento Climático" } },
];

export function getPhenomenonById(id: string): Phenomenon | undefined {
  return PHENOMENA.find((p) => p.id === id);
}

export function getPhenomenonName(id: string, locale: Locale): string {
  const phenomenon = getPhenomenonById(id);
  return phenomenon?.name[locale] ?? phenomenon?.name.en ?? id;
}
