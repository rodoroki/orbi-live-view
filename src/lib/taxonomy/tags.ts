import { z } from "zod";
import type { Locale } from "@/lib/i18n";

/**
 * ORBI TAXONOMY — Tags
 *
 * Fonte única de verdade para tags. Ver pontos 16 e 19 do plano de
 * continuidade. Tags são flexíveis e NÃO substituem categorias ou
 * fenômenos — um evento pode ter zero ou várias.
 */

export const TagSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.record(z.enum(["en", "pt-BR", "es"]), z.string()),
});

export type Tag = z.infer<typeof TagSchema>;

export const TAGS: Tag[] = [
  { id: "active", slug: "active", name: { en: "Active", "pt-BR": "Ativo", es: "Activo" } },
  { id: "severe", slug: "severe", name: { en: "Severe", "pt-BR": "Severo", es: "Severo" } },
  { id: "extreme", slug: "extreme", name: { en: "Extreme", "pt-BR": "Extremo", es: "Extremo" } },
  { id: "major", slug: "major", name: { en: "Major", "pt-BR": "Grande", es: "Grande" } },
  { id: "minor", slug: "minor", name: { en: "Minor", "pt-BR": "Pequeno", es: "Menor" } },
  { id: "smoke", slug: "smoke", name: { en: "Smoke", "pt-BR": "Fumaça", es: "Humo" } },
  { id: "ash", slug: "ash", name: { en: "Ash", "pt-BR": "Cinzas", es: "Ceniza" } },
  { id: "eruption", slug: "eruption", name: { en: "Eruption", "pt-BR": "Erupção", es: "Erupción" } },
  { id: "aftershock", slug: "aftershock", name: { en: "Aftershock", "pt-BR": "Réplica", es: "Réplica" } },
  { id: "heavy-rain", slug: "heavy-rain", name: { en: "Heavy Rain", "pt-BR": "Chuva Forte", es: "Lluvia Fuerte" } },
  { id: "strong-wind", slug: "strong-wind", name: { en: "Strong Wind", "pt-BR": "Vento Forte", es: "Viento Fuerte" } },
  { id: "high-waves", slug: "high-waves", name: { en: "High Waves", "pt-BR": "Ondas Altas", es: "Olas Altas" } },
  { id: "drought", slug: "drought", name: { en: "Drought", "pt-BR": "Seca", es: "Sequía" } },
  { id: "heatwave", slug: "heatwave", name: { en: "Heatwave", "pt-BR": "Onda de Calor", es: "Ola de Calor" } },
  { id: "coldwave", slug: "coldwave", name: { en: "Coldwave", "pt-BR": "Onda de Frio", es: "Ola de Frío" } },
  { id: "tropical", slug: "tropical", name: { en: "Tropical", "pt-BR": "Tropical", es: "Tropical" } },
  { id: "coastal", slug: "coastal", name: { en: "Coastal", "pt-BR": "Costeiro", es: "Costero" } },
  { id: "marine", slug: "marine", name: { en: "Marine", "pt-BR": "Marinho", es: "Marino" } },
  { id: "land", slug: "land", name: { en: "Land", "pt-BR": "Terrestre", es: "Terrestre" } },
  { id: "atmospheric", slug: "atmospheric", name: { en: "Atmospheric", "pt-BR": "Atmosférico", es: "Atmosférico" } },
  { id: "climate", slug: "climate", name: { en: "Climate", "pt-BR": "Climático", es: "Climático" } },
  { id: "el-nino", slug: "el-nino", name: { en: "El Niño", "pt-BR": "El Niño", es: "El Niño" } },
  { id: "la-nina", slug: "la-nina", name: { en: "La Niña", "pt-BR": "La Niña", es: "La Niña" } },
];

export function getTagById(id: string): Tag | undefined {
  return TAGS.find((t) => t.id === id);
}

export function getTagName(id: string, locale: Locale): string {
  const tag = getTagById(id);
  return tag?.name[locale] ?? tag?.name.en ?? id;
}
