import type { OrbiEvent } from "@/lib/schemas";

/**
 * ORBI DATA CORE — Data Source Abstraction
 *
 * Ver ponto 20 do plano de continuidade. A interface da aplicação NÃO
 * deve saber de onde vieram os dados — todo provider (EONET, USGS,
 * NOAA, Windy...) implementa este contrato e devolve OrbiEvent[].
 *
 * Arquitetura:
 *   Fonte externa → Adapter → Normalizer → OrbiEvent → TanStack Query → UI
 */
export interface OrbiDataSource {
  id: string;
  name: string;
  fetchEvents(): Promise<OrbiEvent[]>;
}
