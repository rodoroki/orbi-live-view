import { z } from "zod";

/**
 * ORBI DATA CORE — Source
 *
 * Representa a fonte de dados de um OrbiEvent (ex.: NASA EONET).
 * Entidade própria para permitir futuramente correlacionar o mesmo
 * fenômeno vindo de fontes diferentes. Ver ponto 11.
 */

export const SourceTypeSchema = z.enum([
  "space-agency",
  "scientific-agency",
  "meteorological",
  "geological",
  "oceanographic",
  "satellite",
  "aviation",
  "other",
]);

export type SourceType = z.infer<typeof SourceTypeSchema>;

export const SourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: SourceTypeSchema,
  url: z.string().url().optional(),
  /** Identificador do evento na fonte original (ex.: id do evento no EONET) */
  externalId: z.string().optional(),
});

export type Source = z.infer<typeof SourceSchema>;
