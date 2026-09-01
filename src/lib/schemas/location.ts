import { z } from "zod";

/**
 * ORBI DATA CORE — Location
 *
 * Representa a localização geográfica de um OrbiEvent.
 * Ver ponto 10 do plano de continuidade do ORBI LIVE.
 */

export const LocationEntityTypeSchema = z.enum([
  "country",
  "region",
  "city",
  "ocean",
  "sea",
  "continent",
  "area",
  "unknown",
]);

export type LocationEntityType = z.infer<typeof LocationEntityTypeSchema>;

export const LocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  /** Nome de exibição amigável (ex.: "Amazônia, Brasil") */
  name: z.string(),
  entityType: LocationEntityTypeSchema,
});

export type Location = z.infer<typeof LocationSchema>;
