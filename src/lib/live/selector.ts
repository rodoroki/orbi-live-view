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
import {
  DISCOVERY_REGIONS,
  DISCOVERY_WINDOW,
  useWebcamDiscovery,
  webcamQueryOptions,
  type DiscoveredWebcam,
} from "./discovery";
import { webcamToScene, type LiveScene } from "./scene";
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
const FAILED_CAMERA_COOLDOWN_MS = 10 * 60_000;
const DISCOVERY_BACKOFF_MS = [5_000, 15_000, 30_000, 60_000] as const;

export type SceneSelection = {
  scene: LiveScene | null;
  isLoading: boolean;
  /** avança manualmente (usado também quando a imagem falha) */
  next: () => void;
  /** tenta renovar a câmera atual antes de selecionar outra */
  recover: () => Promise<void>;
  /** confirma que a imagem entrou no ar e encerra a tentativa de recuperação */
  markActive: () => void;
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
  const [currentSource, setCurrentSource] = useState<DiscoveredWebcam | null>(null);
  const [failedUntil, setFailedUntil] = useState<Record<string, number>>({});
  const recoveringRef = useRef(false);
  const refreshedSceneRef = useRef<string | null>(null);
  const discoveryAttemptRef = useRef(0);

  const { webcams, isLoading, retryDiscovery } = useWebcamDiscovery(regionOffset);
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
      rankCandidates(
        webcams.filter((cam) => (failedUntil[cam.id] ?? 0) <= Date.now()),
        {
        mode,
        now: new Date(),
        memory,
        events: events ?? [],
        weatherFor,
        },
      ),
    [webcams, mode, memory, events, weatherFor, failedUntil],
  );

  const rankedRef = useRef(ranked);
  rankedRef.current = ranked;

  /** Escolhe a melhor cena disponível e avança a janela de descoberta. */
  const activateNext = useCallback((excludeId?: string) => {
    const now = Date.now();
    const best = rankedRef.current.find(
      (candidate) =>
        candidate.scene.id !== excludeId && (failedUntil[candidate.scene.id] ?? 0) <= now,
    );
    if (!best) {
      setRegionOffset((o) => (o + DISCOVERY_WINDOW) % DISCOVERY_REGIONS.length);
      return;
    }
    debugSelection(best, mode);
    setCurrent(best);
    const source = webcams.find((w) => w.id === best.scene.id) ?? null;
    setCurrentSource(source);
    refreshedSceneRef.current = null;
    discoveryAttemptRef.current = 0;
    setMemory((m) =>
      rememberScene(m, best, {
        city: webcams.find((w) => w.id === best.scene.id)?.city,
        country: webcams.find((w) => w.id === best.scene.id)?.country,
      }),
    );
    // gira lentamente o universo de candidatos, sem inundar a API
    setRegionOffset((o) => (o + 1) % DISCOVERY_REGIONS.length);
  }, [failedUntil, mode, webcams]);

  const next = useCallback(() => activateNext(), [activateNext]);

  const markActive = useCallback(() => {
    recoveringRef.current = false;
    refreshedSceneRef.current = null;
    if (import.meta.env.DEV && current) {
      console.debug(`[ORBI LIVE] scene activated: ${current.scene.id}`);
    }
  }, [current]);

  const recover = useCallback(async () => {
    if (recoveringRef.current || !current || !currentSource) return;
    recoveringRef.current = true;
    const failedId = current.scene.id;

    try {
      if (refreshedSceneRef.current !== failedId) {
        refreshedSceneRef.current = failedId;
        if (import.meta.env.DEV) console.debug(`[ORBI LIVE] image refresh: ${failedId}`);
        const refreshed = await queryClient.fetchQuery({
          ...webcamQueryOptions(currentSource.origin),
          staleTime: 0,
        });
        const sameCamera = refreshed.find((cam) => cam.id === failedId && cam.imageUrl);
        if (sameCamera?.imageUrl && sameCamera.imageUrl !== current.scene.imageUrl) {
          const source = { ...sameCamera, origin: currentSource.origin };
          setCurrentSource(source);
          setCurrent((candidate) =>
            candidate ? { ...candidate, scene: webcamToScene(source) } : candidate,
          );
          recoveringRef.current = false;
          if (import.meta.env.DEV) {
            console.debug(`[ORBI LIVE] image recovery succeeded: ${failedId}`);
          }
          return;
        }
      }
    } catch {
      // O fallback abaixo mantém a falha silenciosa para o público.
    }

    setFailedUntil((failed) => ({
      ...Object.fromEntries(
        Object.entries(failed).filter(([, until]) => until > Date.now()),
      ),
      [failedId]: Date.now() + FAILED_CAMERA_COOLDOWN_MS,
    }));
    recoveringRef.current = false;
    if (import.meta.env.DEV) console.debug(`[ORBI LIVE] fallback to next scene: ${failedId}`);
    activateNext(failedId);
  }, [activateNext, current, currentSource, queryClient]);

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

  // Watchdog de ausência de candidatos: retry localizado, com backoff limitado.
  useEffect(() => {
    if (current || isLoading || ranked.length > 0) {
      discoveryAttemptRef.current = 0;
      return;
    }
    const attempt = Math.min(discoveryAttemptRef.current, DISCOVERY_BACKOFF_MS.length - 1);
    const timer = window.setTimeout(async () => {
      if (import.meta.env.DEV) console.debug(`[ORBI LIVE] discovery retry: ${attempt + 1}`);
      discoveryAttemptRef.current += 1;
      await retryDiscovery();
      setRegionOffset((o) => (o + DISCOVERY_WINDOW) % DISCOVERY_REGIONS.length);
    }, DISCOVERY_BACKOFF_MS[attempt]);
    return () => window.clearTimeout(timer);
  }, [current, isLoading, ranked.length, retryDiscovery]);

  return {
    scene: current?.scene ?? null,
    isLoading: isLoading && !current,
    next,
    recover,
    markActive,
  };
}
