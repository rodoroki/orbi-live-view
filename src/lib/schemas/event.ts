import { z } from "zod";
import { LocationSchema } from "./location";
import { SourceSchema } from "./source";

/**
 * ORBI DATA CORE — Event
 *
 * Modelo definitivo de evento do ORBI (V1). Ver pontos 8 e 9 do plano
 * de continuidade.
 *
 * CATEGORY ≠ PHENOMENON ≠ TAG:
 * - category: agrupamento amplo (ex.: "natural-events")
 * - phenomenon: o fenômeno específico (ex.: "wildfire")
 * - tags: atributos livres e compostos (ex.: "active", "smoke")
 *
 * category/phenomenon/tags aqui são apenas os `id`s definidos em
 * src/lib/taxonomy — este schema não redefine a taxonomia, apenas
 * referencia os identificadores estáveis.
 */

export const StatusSchema = z.enum(["active", "ongoing", "ended", "unknown"]);
export type Status = z.infer<typeof StatusSchema>;

export const SeveritySchema = z.enum([
  "low",
  "moderate",
  "high",
  "critical",
  "unknown",
]);
export type Severity = z.infer<typeof SeveritySchema>;

export const PrioritySchema = z.enum(["low", "normal", "high", "critical"]);
export type Priority = z.infer<typeof PrioritySchema>;

/**
 * Geometry — modelo estilo GeoJSON simplificado. Permite que o ORBI
 * trabalhe futuramente não apenas com pontos, mas também com áreas e
 * trajetórias (fontes que fornecem polígonos, linhas etc). Ver ponto 15.
 */
const Coordinate = z.tuple([z.number(), z.number()]); // [longitude, latitude]

export const GeometrySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("Point"), coordinates: Coordinate }),
  z.object({
    type: z.literal("LineString"),
    coordinates: z.array(Coordinate).min(2),
  }),
  z.object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(Coordinate).min(4)),
  }),
  z.object({
    type: z.literal("MultiPoint"),
    coordinates: z.array(Coordinate),
  }),
  z.object({
    type: z.literal("MultiLineString"),
    coordinates: z.array(z.array(Coordinate).min(2)),
  }),
  z.object({
    type: z.literal("MultiPolygon"),
    coordinates: z.array(z.array(z.array(Coordinate).min(4))),
  }),
]);

export type Geometry = z.infer<typeof GeometrySchema>;

export const OrbiEventSchema = z.object({
  /** Identificador interno estável do ORBI (não o id da fonte) */
  id: z.string(),
  /** Identificador do evento na fonte original (ex.: id no EONET) */
  externalId: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  /** id de uma Category definida em src/lib/taxonomy/categories.ts */
  category: z.string(),
  /** id de um Phenomenon definido em src/lib/taxonomy/phenomena.ts */
  phenomenon: z.string(),
  /** ids de Tags definidas em src/lib/taxonomy/tags.ts */
  tags: z.array(z.string()).default([]),
  location: LocationSchema,
  status: StatusSchema,
  severity: SeveritySchema,
  priority: PrioritySchema,
  detectedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  source: SourceSchema,
  geometry: GeometrySchema,
  sourceUrl: z.string().url().optional(),
  /** Campo de escape para dados específicos da fonte que ainda não
   * mereceram virar campo de primeira classe (ex.: magnitude, FRP, AOD) */
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type OrbiEvent = z.infer<typeof OrbiEventSchema>;
