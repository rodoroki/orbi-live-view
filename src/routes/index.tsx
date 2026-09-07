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
import NowOnPlanet from "@/components/orbi/NowOnPlanet";
import type { GeoPlace } from "@/lib/geo-search";
import { CATEGORY_META, type EventCategory, type OrbiEvent } from "@/lib/orbi-events";
import { useTranslation } from "@/lib/i18n";
import { useEonetEvents } from "@/lib/eonet";
import { useUsgsEarthquakes } from "@/lib/usgs";
import { useNwsAlerts } from "@/lib/nws";
import { useUserLocation } from "@/lib/user-location";
import { useIsMobile } from "@/hooks/use-mobile";
import { rankEvents } from "@/lib/intelligence";
import { jsonLdScript, organizationJsonLd, seoLinks, seoMeta, websiteJsonLd } from "@/lib/seo";

const GlobeView = lazy(() => import("@/components/orbi/GlobeView"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...seoMeta({
        path: "/",
        title: "ORBI LIVE — Real-Time Earth Intelligence",
        description:
          "Explore Earth in real time. Discover earthquakes, natural events, severe weather and atmospheric conditions around the planet with ORBI LIVE.",
      }),
    ],
    links: seoLinks("/"),
    scripts: [jsonLdScript(websiteJsonLd), jsonLdScript(organizationJsonLd)],
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
  const [hour, setHour] = useState(0);
  const globeApi = useRef<{
    zoom: (d: 1 | -1) => void;
    reset: () => void;
    flyTo: (lat: number, lng: number, altitude?: number) => void;
  } | null>(null);

  const { location: userLocation } = useUserLocation();

  // Fontes reais. Sem fallback fictício: se nada responde, nada é exibido.
  const eonet = useEonetEvents({ days: 20, limit: 250 });
  const quakes = useUsgsEarthquakes({ days: 2, minMagnitude: 2.5, limit: 200 });
  const alerts = useNwsAlerts({ severity: "severe", limit: 150 });

  // Três fontes reais convivendo no mesmo modelo, sem duplicar ids.
  const source = useMemo(() => {
    const merged = [...(eonet.data ?? []), ...(quakes.data ?? []), ...(alerts.data ?? [])];
    const seen = new Set<string>();
    return merged.filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)));
  }, [eonet.data, quakes.data, alerts.data]);

  const sourcesPending = eonet.isPending || quakes.isPending || alerts.isPending;
  const isLive = source.length > 0;

  // O tempo é uma dimensão: no passado só existe o que já havia sido detectado;
  // à frente de agora o ORBI não possui previsão científica, então nada é exibido.
  const events = useMemo(() => {
    if (!layers.includes("events")) return [];
    if (hour > 0) return [];
    const filtered = source.filter((e) => active.includes(e.category));
    if (hour === 0) return filtered;
    return filtered.filter((e) => e.detectedMinutesAgo >= Math.abs(hour) * 60);
  }, [active, layers, source, hour]);

  // Relevance Engine decide o que merece atenção agora (máx. 3).
  const highlights = useMemo(
    () => rankEvents(events, { origin: userLocation }).slice(0, 3),
    [events, userLocation],
  );

  // painel de contexto reabre automaticamente ao selecionar um evento

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

  // ponto de observação: região buscada > evento selecionado > sua localização
  const coords = place
    ? { lat: place.lat, lng: place.lng }
    : selected
      ? { lat: selected.lat, lng: selected.lng }
      : (userLocation ?? { lat: -15.8, lng: -47.9 });

  // Primeiro acesso: o planeta se aproxima discretamente da região do usuário.
  const flownHome = useRef(false);
  useEffect(() => {
    if (!userLocation || flownHome.current) return;
    flownHome.current = true;
    const id = window.setTimeout(
      () => globeApi.current?.flyTo(userLocation.lat, userLocation.lng, 1.6),
      900,
    );
    return () => window.clearTimeout(id);
  }, [userLocation]);

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
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "var(--gradient-void)" }}
    >
      {/* Conteúdo semântico no DOM: descreve o produto a leitores de tela e a mecanismos de busca. */}
      <header className="sr-only">
        <h1>ORBI LIVE — Real-Time Earth Intelligence</h1>
        <p>
          Real-time Earth observation. Explore earthquakes, natural events, severe weather and
          atmospheric conditions happening around the planet, from official sources such as NASA
          EONET, USGS and NOAA.
        </p>
        <nav aria-label="Earth intelligence pages">
          <ul>
            <li>
              <Link to="/earthquakes">Live earthquake map — earthquakes today</Link>
            </li>
            <li>
              <Link to="/natural-events">Natural events happening on Earth</Link>
            </li>
            <li>
              <Link to="/weather">Severe weather alerts and live weather map</Link>
            </li>
            <li>
              <Link to="/sobre">Data sources and transparency</Link>
            </li>
          </ul>
        </nav>
      </header>

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
      {!place && !selected && userLocation && (
        <p className="label-track pointer-events-none absolute right-6 top-24 z-10 hidden text-[9px] text-muted-foreground/60 lg:block">
          {t.planet.youAreHere}
        </p>
      )}
      {!eventsOpen && !conditionsOpen && (
        <NowOnPlanet events={highlights} origin={userLocation} onSelect={handleSelect} />
      )}
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
        <TimelineBar hour={hour} onChange={setHour} />
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
      {webcamsOpen && <WebcamsPanel coords={coords} onClose={() => setWebcamsOpen(false)} />}
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
            setLayers((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]))
          }
        />
      )}
      {filtersOpen && (
        <CategoryFilters
          active={active}
          onClose={() => setFiltersOpen(false)}
          onToggle={(c) =>
            setActive((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
          }
        />
      )}

      {selected && panelOpen && !conditionsOpen && !(isMobile && eventsOpen) && (
        <DiscoveryCard event={selected} events={events} onClose={() => setPanelOpen(false)} />
      )}

      {!selected && panelOpen && !conditionsOpen && !(isMobile && eventsOpen) && (
        <ContextCard event={null} total={events.length} onClose={() => setPanelOpen(false)} />
      )}

      <p className="label-track pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 translate-y-10 text-[9px] text-muted-foreground/60 xl:block">
        {isLive ? t.common.liveData : ""}
      </p>

      {events.length === 0 && layers.includes("events") && !sourcesPending && (
        <p className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-[min(90vw,22rem)] -translate-x-1/2 -translate-y-1/2 text-center text-sm font-light text-muted-foreground/70">
          {hour > 0
            ? t.planet.noForecastWindow
            : isLive
              ? t.planet.calm
              : t.planet.sourceUnavailable}
        </p>
      )}

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
          USGS · NOAA/NWS · Windy · Esri
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
