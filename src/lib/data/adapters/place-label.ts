/**
 * ORBI DATA CORE — Place label
 *
 * Quando a fonte não declara um nome de lugar, o ORBI nunca deve
 * expor latitude/longitude cruas ao utilizador. Em vez disso usamos
 * um rótulo geográfico grosseiro (oceano / grande região), derivado
 * das coordenadas — descritivo, não científico.
 */
export function coarsePlaceLabel(lat: number, lng: number): string {
  if (lat <= -60) return "Southern Ocean";
  if (lat >= 66) return "Arctic Ocean";

  const northern = lat >= 0;
  const ns = northern ? "North" : "South";

  // Faixas longitudinais aproximadas dos grandes oceanos.
  if (lng >= -180 && lng < -100) return `${ns} Pacific`;
  if (lng >= -100 && lng < -30) return northern ? "North Atlantic" : "South Atlantic";
  if (lng >= -30 && lng < 20) return northern ? "North Atlantic" : "South Atlantic";
  if (lng >= 20 && lng < 100) return northern ? "Arabian Sea region" : "Indian Ocean";
  if (lng >= 100 && lng < 150) return northern ? "Western Pacific" : "Indian Ocean";
  return `${ns} Pacific`;
}

/** Usa o nome declarado pela fonte; só cai no rótulo grosseiro se faltar. */
export function placeOrRegion(name: string | null | undefined, lat: number, lng: number): string {
  const trimmed = name?.trim();
  if (trimmed) return trimmed;
  return coarsePlaceLabel(lat, lng);
}
