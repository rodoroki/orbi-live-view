import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { OrbiEvent } from "@/lib/orbi-events";

const HISTORY_LIMIT = 8;

type ExplorationValue = {
  selectedDiscovery: OrbiEvent | null;
  followedDiscovery: OrbiEvent | null;
  /** jornada atual, do mais antigo ao mais recente (inclui o selecionado) */
  explorationHistory: OrbiEvent[];
  previousDiscovery: OrbiEvent | null;
  /** ids já vistos nesta sessão — evita repetição em DESCOBRIR */
  seen: string[];
  select: (event: OrbiEvent | null) => void;
  back: () => void;
  follow: (event: OrbiEvent) => void;
  unfollow: () => void;
};

const ExplorationContext = createContext<ExplorationValue | null>(null);

/** Mantém a descoberta em memória enquanto o usuário navega entre visões e rotas. */
export function ExplorationProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<OrbiEvent[]>([]);
  const [selected, setSelected] = useState<OrbiEvent | null>(null);
  const [followed, setFollowed] = useState<OrbiEvent | null>(null);
  const [seen, setSeen] = useState<string[]>([]);

  const select = useCallback((event: OrbiEvent | null) => {
    setSelected(event);
    if (!event) return;
    setSeen((prev) => (prev.includes(event.id) ? prev : [...prev, event.id].slice(-40)));
    setHistory((prev) => {
      if (prev[prev.length - 1]?.id === event.id) return prev;
      return [...prev.filter((e) => e.id !== event.id), event].slice(-HISTORY_LIMIT);
    });
  }, []);

  const back = useCallback(() => {
    setHistory((prev) => {
      if (prev.length < 2) return prev;
      const next = prev.slice(0, -1);
      setSelected(next[next.length - 1] ?? null);
      return next;
    });
  }, []);

  const value = useMemo<ExplorationValue>(
    () => ({
      selectedDiscovery: selected,
      followedDiscovery: followed,
      explorationHistory: history,
      previousDiscovery: history.length > 1 ? (history[history.length - 2] ?? null) : null,
      seen,
      select,
      back,
      follow: setFollowed,
      unfollow: () => setFollowed(null),
    }),
    [selected, followed, history, seen, select, back],
  );

  return <ExplorationContext.Provider value={value}>{children}</ExplorationContext.Provider>;
}

export function useExploration() {
  const ctx = useContext(ExplorationContext);
  if (!ctx) throw new Error("useExploration must be used inside ExplorationProvider");
  return ctx;
}
