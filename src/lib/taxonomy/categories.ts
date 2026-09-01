import { z } from "zod";
import type { Locale } from "@/lib/i18n";

/**
 * ORBI TAXONOMY — Categories
 *
 * Fonte única de verdade para categorias. Ver pontos 16 e 17 do plano
 * de continuidade. Categorias são agrupamentos amplos — não confundir
 * com Phenomenon (fenômeno específico) nem Tag (atributo livre).
 *
 * Não adicionar categorias sem necessidade real.
 */

export const CategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.record(z.enum(["en", "pt-BR", "es"]), z.string()),
  description: z.record(z.enum(["en", "pt-BR", "es"]), z.string()).optional(),
  icon: z.string(),
  priority: z.number().min(1).max(5),
});

export type Category = z.infer<typeof CategorySchema>;

export const CATEGORIES: Category[] = [
  {
    id: "natural-events",
    slug: "natural-events",
    icon: "activity",
    priority: 1,
    name: { en: "Natural Events", "pt-BR": "Eventos Naturais", es: "Eventos Naturales" },
  },
  {
    id: "weather",
    slug: "weather",
    icon: "cloud-rain",
    priority: 2,
    name: { en: "Weather", "pt-BR": "Clima", es: "Clima" },
  },
  {
    id: "atmosphere",
    slug: "atmosphere",
    icon: "wind",
    priority: 2,
    name: { en: "Atmosphere", "pt-BR": "Atmosfera", es: "Atmósfera" },
  },
  {
    id: "ocean",
    slug: "ocean",
    icon: "waves",
    priority: 2,
    name: { en: "Ocean", "pt-BR": "Oceano", es: "Océano" },
  },
  {
    id: "climate",
    slug: "climate",
    icon: "thermometer",
    priority: 3,
    name: { en: "Climate", "pt-BR": "Clima Global", es: "Clima Global" },
  },
  {
    id: "geology",
    slug: "geology",
    icon: "mountain",
    priority: 1,
    name: { en: "Geology", "pt-BR": "Geologia", es: "Geología" },
  },
  {
    id: "fire",
    slug: "fire",
    icon: "flame",
    priority: 1,
    name: { en: "Fire", "pt-BR": "Incêndios", es: "Incendios" },
  },
];

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getCategoryName(id: string, locale: Locale): string {
  const category = getCategoryById(id);
  return category?.name[locale] ?? category?.name.en ?? id;
}
