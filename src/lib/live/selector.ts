/**
 * ORBI LIVE — Intelligent Scene Selector.
 *
 * Discovery → Evaluation → Scoring → Selection → LiveScene.
 * O palco continua recebendo apenas { scene, isLoading, next } e nunca sabe
 * como a cena foi escolhida.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { Metric } from "@/lib/conditions";
import { useNaturalEvents } from "@/lib/nasa/events";
import { DISCOVERY_REGIONS, DISCOVERY_WINDOW, useWebcamDiscovery } from "./discovery";
import type { LiveScene } from "./scene";
import {
  EMPTY_MEMORY,
  debugSelection,
  rankCandidates,
  rememberScene,
  type SceneCandidate,
  type SceneMemory,
  type SceneMode,
  type WeatherSignal,
} from "./scoring";

const SCENE_DURATION_MS = 45_000;

export type SceneSelection = {
  scene: LiveScene | null;
  isLoading: boolean;
  /** avança manualmente (usado também quando a imagem falha) */
  next: () => void;
};

/** Extrai número de um valor já formatado pelo painel de condições. */
function numberFrom(metrics: Metric[] | null | undefined, key: string): number | undefined {
  const metric = metrics?.find((m) => m.key === key);
  if (!metric) return undefined;
  const parsed = Number.parseFloat(metric.value.replace(",", ".").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function useSceneSelector(mode: SceneMode = "world"): SceneSelection {
  const queryClient = useQueryClient();
  const [regionOffset, setRegionOffset] = useState(0);
  const [memory, setMemory] = useState<SceneMemory>(EMPTY_MEMORY);
  const [current, setCurrent] = useState<SceneCandidate | null>(null);

  const { webcams, isLoading } = useWebcamDiscovery(regionOffset);
  const { data: events } = useNaturalEvents();

  /** Clima só a partir do que já está em cache — nenhuma requisição nova. */
  const weatherFor = useCallback(
    (scene: LiveScene): WeatherSignal | null => {
      const metrics = queryClient.getQueryData<Metric[] | null>([
        "windy-forecast",
        scene.lat,
        scene.lng,
      ]);
      if (!metrics) return null;
      return {
        windKt: numberFrom(metrics, "wind"),
        precipMmH: numberFrom(metrics, "precipitation"),
        cloudPct: numberFrom(metrics, "cloud"),
      };
    },
    [queryClient],
  );

  const ranked = useMemo(
    () =>
      rankCandidates(webcams, {
        mode,
        now: new Date(),
        memory,
        events: events ?? [],
        weatherFor,
      }),
    [webcams, mode, memory, events, weatherFor],
  );

  const rankedRef = useRef(ranked);
  rankedRef.current = ranked;

  /** Escolhe a melhor cena disponível e avança a janela de descoberta. */
  const next = useCallback(() => {
    const best = rankedRef.current[0];
    if (!best) {
      setRegionOffset((o) => (o + DISCOVERY_WINDOW) % DISCOVERY_REGIONS.length);
      return;
    }
    debugSelection(best, mode);
    setCurrent(best);
    setMemory((m) =>
      rememberScene(m, best, {
        city: webcams.find((w) => w.id === best.scene.id)?.city,
        country: webcams.find((w) => w.id === best.scene.id)?.country,
      }),
    );
    // gira lentamente o universo de candidatos, sem inundar a API
    setRegionOffset((o) => (o + 1) % DISCOVERY_REGIONS.length);
  }, [mode, webcams]);

  // primeira cena assim que houver candidatos
  useEffect(() => {
    if (current || ranked.length === 0) return;
    next();
  }, [current, ranked.length, next]);

  // um único timer, sempre limpo — sem polling agressivo
  useEffect(() => {
    if (!current) return;
    const timer = window.setTimeout(next, SCENE_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [current, next]);

  return { scene: current?.scene ?? null, isLoading: isLoading && !current, next };
}
