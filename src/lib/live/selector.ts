/**
 * ORBI LIVE — Scene Selector (etapa 1: determinístico).
 *
 * Percorre um conjunto fixo de pontos de observação e apresenta, uma de cada
 * vez, as câmeras reais que a fonte devolve para aquele ponto.
 *
 * Na próxima etapa este módulo será substituído pelo ORBI Intelligent Scene
 * Selector (NASA EONET + relevância). O contrato de saída — "esta é a próxima
 * cena" — permanece o mesmo, por isso o palco não precisa mudar.
 */
import { useCallback, useEffect, useMemo, useState } from "react";

import { useWindyWebcams } from "@/lib/windy";
import { webcamToScene, type LiveScene } from "./scene";

/** Pontos de observação — apenas coordenadas de consulta, não conteúdo. */
const ANCHORS = [
  { lat: -26.99, lng: -48.63 }, // Balneário Camboriú
  { lat: 64.15, lng: -21.94 }, // Reykjavík
  { lat: 35.68, lng: 139.69 }, // Tóquio
  { lat: 40.71, lng: -74.01 }, // Nova Iorque
  { lat: 46.05, lng: 11.12 }, // Alpes / Dolomitas
  { lat: -33.86, lng: 151.21 }, // Sydney
] as const;

const SCENE_DURATION_MS = 45_000;

export type SceneSelection = {
  scene: LiveScene | null;
  isLoading: boolean;
  /** avança manualmente (usado também quando a imagem falha) */
  next: () => void;
};

export function useSceneSelector(): SceneSelection {
  const [anchorIndex, setAnchorIndex] = useState(0);
  const [sceneIndex, setSceneIndex] = useState(0);

  const anchor = ANCHORS[anchorIndex % ANCHORS.length]!;
  const { data, isLoading } = useWindyWebcams(anchor.lat, anchor.lng);

  const scenes = useMemo(
    () => (data ?? []).filter((cam) => cam.imageUrl).map(webcamToScene),
    [data],
  );

  const next = useCallback(() => {
    setSceneIndex((current) => {
      const upcoming = current + 1;
      if (upcoming >= scenes.length) {
        setAnchorIndex((a) => (a + 1) % ANCHORS.length);
        return 0;
      }
      return upcoming;
    });
  }, [scenes.length]);

  // Sem polling agressivo: um único timer, sempre limpo ao trocar de cena.
  useEffect(() => {
    if (scenes.length === 0) return;
    const timer = window.setTimeout(next, SCENE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [scenes.length, sceneIndex, anchorIndex, next]);

  return {
    scene: scenes.length > 0 ? (scenes[sceneIndex % scenes.length] ?? null) : null,
    isLoading,
    next,
  };
}
