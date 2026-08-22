import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string(),
  name: z.record(z.string(), z.string()), // Localized names
  slug: z.string(),
  description: z.record(z.string(), z.string()).optional(),
  icon: z.string(),
  priority: z.number().min(1).max(5),
});

export type Category = z.infer<typeof CategorySchema>;

export const TagSchema = z.object({
  id: z.string(),
  name: z.record(z.string(), z.string()),
  slug: z.string(),
  categoryId: z.string().optional(),
});

export type Tag = z.infer<typeof TagSchema>;

export const GeoEntitySchema = z.object({
  id: z.string(),
  name: z.record(z.string(), z.string()),
  slug: z.string(),
  type: z.enum(['country', 'region', 'ocean', 'city']),
  countryCode: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
});

export type GeoEntity = z.infer<typeof GeoEntitySchema>;

export const CATEGORIES: Category[] = [
  {
    id: 'natural-events',
    slug: 'natural-events',
    priority: 1,
    icon: 'activity',
    name: {
      en: 'Natural Events',
      'pt-BR': 'Eventos Naturais',
      es: 'Eventos Naturales',
    },
  },
  {
    id: 'weather',
    slug: 'weather',
    priority: 2,
    icon: 'cloud',
    name: {
      en: 'Weather',
      'pt-BR': 'Clima',
      es: 'Clima',
    },
  },
  {
    id: 'fire',
    slug: 'fire',
    priority: 1,
    icon: 'flame',
    name: {
      en: 'Fire',
      'pt-BR': 'Incêndios',
      es: 'Incendios',
    },
  },
  // ... more categories can be added here
];

export const TAGS: Tag[] = [
  {
    id: 'wildfire',
    slug: 'wildfire',
    categoryId: 'fire',
    name: {
      en: 'Wildfire',
      'pt-BR': 'Incêndio Florestal',
      es: 'Incendio Forestal',
    },
  },
  {
    id: 'earthquake',
    slug: 'earthquake',
    categoryId: 'natural-events',
    name: {
      en: 'Earthquake',
      'pt-BR': 'Terremoto',
      es: 'Terremoto',
    },
  },
];
