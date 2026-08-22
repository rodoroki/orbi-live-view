import { Suspense, lazy, useCallback, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import {
  CategoryFilters,
  ContextCard,
  MapTools,
  ToolRail,
  ViewToggle,
} from "@/components/orbi/MapControls";
import FlatMapView from "@/components/orbi/FlatMapView";
import {
  CATEGORY_META,
  ORBI_EVENTS,
  type EventCategory,
  type OrbiEvent,
} from "@/lib/orbi-events";
import { useTranslation } from "@/lib/i18n";


const GlobeView = lazy(() => import("@/components/orbi/GlobeView"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ORBI LIVE — Mapa planetário" },
      {
        name: "description",
        content:
          "Observe o planeta em uma interface minimalista de inteligência planetária: globo 3D, eventos, atmosfera e oceanos em um único mapa.",
      },
      { property: "og:title", content: "ORBI LIVE — Mapa planetário" },
      {
        property: "og:description",
        content: "Uma janela sofisticada para observar a Terra.",
      },
    ],
  }),
  component: Index,
});

const ALL_CATEGORIES = Object.keys(CATEGORY_META) as EventCategory[];

function Index() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"flat" | "globe">("globe");
  const [selected, setSelected] = useState<OrbiEvent | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [active, setActive] = useState<EventCategory[]>(ALL_CATEGORIES);
  const [flatScale, setFlatScale] = useState(1);
  const globeApi = useRef<{ zoom: (d: 1 | -1) => void; reset: () => void } | null>(
    null,
  );


  const events = useMemo(
    () => ORBI_EVENTS.filter((e) => active.includes(e.category)),
    [active],
  );

  const handleSelect = useCallback((event: OrbiEvent) => {
    setSelected(event);
    setPanelOpen(true);
  }, []);

  const handleZoom = (direction: 1 | -1) => {
    if (mode === "globe") globeApi.current?.zoom(direction);
    else setFlatScale((s) => Math.min(3, Math.max(1, s + direction * 0.25)));
  };

  const handleReset = () => {
    setSelected(null);
    if (mode === "globe") globeApi.current?.reset();
    else setFlatScale(1);
  };

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "var(--gradient-void)" }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
          backgroundSize: "84px 84px",
        }}
      />

      <div className="absolute inset-0">
        {mode === "globe" ? (
          <ClientOnly fallback={<StageFallback />}>
            <Suspense fallback={<StageFallback />}>
              <GlobeView
                events={events}
                selected={selected}
                onSelect={handleSelect}
                onReady={(api) => {
                  globeApi.current = api;
                }}
              />
            </Suspense>
          </ClientOnly>
        ) : (
          <div
            className="h-full w-full transition-transform duration-500"
            style={{ transform: `scale(${flatScale})` }}
          >
            <FlatMapView events={events} selected={selected} onSelect={handleSelect} />
          </div>
        )}
      </div>

      <ToolRail />
      <MapTools
        onZoom={handleZoom}
        onReset={handleReset}
        onToggleFilters={() => setFiltersOpen((v) => !v)}
        filtersOpen={filtersOpen}
      />
      <ViewToggle mode={mode} onChange={setMode} />
      {filtersOpen && (
        <CategoryFilters
          active={active}
          onToggle={(c) =>
            setActive((prev) =>
              prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
            )
          }
        />
      )}
      {panelOpen && (
        <ContextCard
          event={selected}
          total={events.length}
          onClose={() => setPanelOpen(false)}
        />
      )}

      <p className="label-track pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 translate-y-10 text-[9px] text-muted-foreground/60 xl:block">
        {t.common.simulatedData}
      </p>

    </div>
  );
}

function StageFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-[min(70vh,700px)] w-[min(70vh,700px)] rounded-full border border-primary/10" />
    </div>
  );
}
