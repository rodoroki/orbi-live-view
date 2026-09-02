import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import {
  CategoryFilters,
  ContextCard,
  LayersPanel,
  MAP_LAYERS,
  type MapLayer,
  MapTools,
  ToolRail,
  ViewToggle,
} from "@/components/orbi/MapControls";
import FlatMapView from "@/components/orbi/FlatMapView";
import EventsPanel from "@/components/orbi/EventsPanel";
import TimelineBar from "@/components/orbi/TimelineBar";
import ConditionsPanel from "@/components/orbi/ConditionsPanel";
import WeatherMapOverlay from "@/components/orbi/WeatherMapOverlay";
import {
  CATEGORY_META,
  ORBI_EVENTS,
  type EventCategory,
  type OrbiEvent,
} from "@/lib/orbi-events";
import { useTranslation } from "@/lib/i18n";
import { useEonetEvents } from "@/lib/eonet";
import { useIsMobile } from "@/hooks/use-mobile";


const GlobeView = lazy(() => import("@/components/orbi/GlobeView"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ORBI LIVE — Earth Intelligence" },
      {
        name: "description",
        content:
          "ORBI LIVE is a planetary intelligence platform for real-time observation of Earth events, atmosphere, and oceans.",
      },
      { property: "og:title", content: "ORBI LIVE — Earth Intelligence" },
      {
        property: "og:description",
        content: "A sophisticated window for observing the planet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});


const ALL_CATEGORIES = Object.keys(CATEGORY_META) as EventCategory[];

function Index() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [mode, setMode] = useState<"flat" | "globe">("globe");
  const [selected, setSelected] = useState<OrbiEvent | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [layers, setLayers] = useState<MapLayer[]>(MAP_LAYERS);
  const [eventsOpen, setEventsOpen] = useState(true);
  const [conditionsOpen, setConditionsOpen] = useState(false);
  const [weatherMapOpen, setWeatherMapOpen] = useState(false);
  const [active, setActive] = useState<EventCategory[]>(ALL_CATEGORIES);
  const [flatScale, setFlatScale] = useState(1);
  const globeApi = useRef<{ zoom: (d: 1 | -1) => void; reset: () => void } | null>(
    null,
  );


  // Fonte real (NASA EONET) com fallback para os dados simulados.
  const { data: liveEvents } = useEonetEvents({ days: 20, limit: 250 });
  const isLive = !!liveEvents && liveEvents.length > 0;
  const source = isLive ? liveEvents : ORBI_EVENTS;

  const events = useMemo(
    () =>
      layers.includes("events")
        ? source.filter((e) => active.includes(e.category))
        : [],
    [active, layers, source],
  );

  // no mobile o mapa abre limpo; os painéis são acionados sob demanda
  useEffect(() => {
    if (isMobile) {
      setEventsOpen(false);
      setPanelOpen(false);
    }
  }, [isMobile]);

  const handleGlobeReady = useCallback(
    (api: { zoom: (d: 1 | -1) => void; reset: () => void }) => {
      globeApi.current = api;
    },
    [],
  );

  const handleSelect = useCallback(
    (event: OrbiEvent) => {
      setSelected(event);
      setPanelOpen(true);
      // no mobile o painel de eventos vira card deslizante: fecha ao selecionar
      if (isMobile) setEventsOpen(false);
    },
    [isMobile],
  );

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
                onReady={handleGlobeReady}
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
        onToggleLayers={() => setLayersOpen((v) => !v)}
        layersOpen={layersOpen}
        onToggleEvents={() => setEventsOpen((v) => !v)}
        eventsOpen={eventsOpen}
        onToggleConditions={() => {
          setConditionsOpen((v) => !v);
          setPanelOpen(false);
        }}
        conditionsOpen={conditionsOpen}
      />
      <TimelineBar />
      {conditionsOpen && (
        <ConditionsPanel
          onClose={() => setConditionsOpen(false)}
          onOpenWeatherMap={() => setWeatherMapOpen(true)}
          coords={
            selected
              ? { lat: selected.lat, lng: selected.lng }
              : { lat: -15.8, lng: -47.9 }
          }
        />
      )}
      {weatherMapOpen && <WeatherMapOverlay onClose={() => setWeatherMapOpen(false)} />}
      <ViewToggle mode={mode} onChange={setMode} />
      {eventsOpen && (
        <EventsPanel
          events={events}
          selected={selected}
          onSelect={handleSelect}
          onClose={() => setEventsOpen(false)}
        />
      )}
      {layersOpen && (
        <LayersPanel
          active={layers}
          onToggle={(l) =>
            setLayers((prev) =>
              prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l],
            )
          }
        />
      )}
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
      {panelOpen && !conditionsOpen && !(isMobile && eventsOpen) && (
        <ContextCard
          event={selected}
          total={events.length}
          onClose={() => setPanelOpen(false)}
        />
      )}

      <p className="label-track pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 translate-y-10 text-[9px] text-muted-foreground/60 xl:block">
        {isLive ? t.common.liveData : t.common.simulatedData}
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
