import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
import DiscoveryCard from "@/components/orbi/DiscoveryCard";
import TimelineBar from "@/components/orbi/TimelineBar";
import ConditionsPanel from "@/components/orbi/ConditionsPanel";
import WeatherMapOverlay from "@/components/orbi/WeatherMapOverlay";
import RegionSearch from "@/components/orbi/RegionSearch";
import WebcamsPanel from "@/components/orbi/WebcamsPanel";
import type { GeoPlace } from "@/lib/geo-search";
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
  const [panelOpen, setPanelOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [layers, setLayers] = useState<MapLayer[]>(MAP_LAYERS);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [conditionsOpen, setConditionsOpen] = useState(false);
  const [weatherMapOpen, setWeatherMapOpen] = useState(false);
  const [webcamsOpen, setWebcamsOpen] = useState(false);
  const [place, setPlace] = useState<GeoPlace | null>(null);
  const [active, setActive] = useState<EventCategory[]>(ALL_CATEGORIES);
  const [flatScale, setFlatScale] = useState(1);
  const globeApi = useRef<{
    zoom: (d: 1 | -1) => void;
    reset: () => void;
    flyTo: (lat: number, lng: number, altitude?: number) => void;
  } | null>(null);


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
    (api: {
      zoom: (d: 1 | -1) => void;
      reset: () => void;
      flyTo: (lat: number, lng: number, altitude?: number) => void;
    }) => {
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

  // ponto de observação ativo: região buscada > evento selecionado > Brasília
  const coords = place
    ? { lat: place.lat, lng: place.lng }
    : selected
      ? { lat: selected.lat, lng: selected.lng }
      : { lat: -15.8, lng: -47.9 };

  const handlePickPlace = useCallback((next: GeoPlace) => {
    setPlace(next);
    setSelected(null);
    setConditionsOpen(true);
    globeApi.current?.flyTo(next.lat, next.lng, next.kind === "continent" ? 1.9 : 0.9);
  }, []);

  // A interface recua quando o usuário apenas observa o planeta.
  const [chrome, setChrome] = useState(true);
  useEffect(() => {
    let timer: number | undefined;
    const wake = () => {
      setChrome(true);
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => setChrome(false), 7000);
    };
    wake();
    window.addEventListener("pointermove", wake);
    window.addEventListener("pointerdown", wake);
    window.addEventListener("keydown", wake);
    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
    };
  }, []);

  const handleZoom = (direction: 1 | -1) => {
    if (mode === "globe") globeApi.current?.zoom(direction);
    else setFlatScale((s) => Math.min(3, Math.max(1, s + direction * 0.25)));
  };

  const handleReset = () => {
    setSelected(null);
    setPlace(null);
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
                focus={place ? { lat: place.lat, lng: place.lng, name: place.name } : null}
                showRegions={layers.includes("base")}
                onPickRegion={(r) =>
                  handlePickPlace({
                    id: `region-${r.name}`,
                    name: r.name,
                    detail: "",
                    lat: r.lat,
                    lng: r.lng,
                    kind: "country",
                  })
                }
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
      <RegionSearch onPick={handlePickPlace} current={place} />
      <div
        className={`transition-opacity duration-700 ${
          chrome ? "opacity-100" : "opacity-0 hover:opacity-100"
        }`}
      >
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
        onToggleWebcams={() => setWebcamsOpen((v) => !v)}
        webcamsOpen={webcamsOpen}
      />
      <TimelineBar />
      <ViewToggle mode={mode} onChange={setMode} />
      </div>
      {conditionsOpen && (
        <ConditionsPanel
          onClose={() => setConditionsOpen(false)}
          onOpenWeatherMap={() => setWeatherMapOpen(true)}
          coords={coords}
        />
      )}
      {weatherMapOpen && (
        <WeatherMapOverlay onClose={() => setWeatherMapOpen(false)} coords={coords} />
      )}
      {webcamsOpen && (
        <WebcamsPanel coords={coords} onClose={() => setWebcamsOpen(false)} />
      )}
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
          onClose={() => setLayersOpen(false)}
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
          onClose={() => setFiltersOpen(false)}
          onToggle={(c) =>
            setActive((prev) =>
              prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
            )
          }
        />
      )}

      {selected && panelOpen && !conditionsOpen && !(isMobile && eventsOpen) && (
        <DiscoveryCard event={selected} onClose={() => setPanelOpen(false)} />
      )}

      {!selected && panelOpen && !conditionsOpen && !(isMobile && eventsOpen) && (
        <ContextCard
          event={null}
          total={events.length}
          onClose={() => setPanelOpen(false)}
        />
      )}

      <p className="label-track pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 translate-y-10 text-[9px] text-muted-foreground/60 xl:block">
        {isLive ? t.common.liveData : t.common.simulatedData}
      </p>

      {/* Crédito de fonte — discreto, porém visível: credibilidade da informação */}
      <Link
        to="/sobre"
        className="focus-ring absolute bottom-5 left-4 z-10 hidden items-center gap-2 rounded-full border border-border/50 bg-background/40 px-3 py-1.5 backdrop-blur transition-colors duration-200 hover:border-primary/40 md:flex"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
        <span className="label-track text-[9px] text-foreground/80">NASA EONET</span>
        <span className="text-muted-foreground/30">·</span>
        <span className="label-track text-[9px] text-muted-foreground/70">
          Windy · Esri · USGS
        </span>
      </Link>
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
