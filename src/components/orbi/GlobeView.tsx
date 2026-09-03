import { useEffect, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { CATEGORY_META, type OrbiEvent } from "@/lib/orbi-events";

/**
 * ORBI LIVE WORLD — Globe v2
 *
 * Arquitetura em camadas:
 * - Earth Base (textura noturna)
 * - Terrain / Relief (bump map)
 * - Observation Layer (pontos + anéis de prioridade)
 * - Atmospheric Layer (preparada para Windy — não renderiza ainda)
 * - Camera / Zoom
 *
 * A base cartográfica é independente dos dados de observação:
 * NASA/Windy entram como camadas, não como "o mapa inteiro".
 */

// -----------------------------------------------------------------------------
// EARTH BASE
// -----------------------------------------------------------------------------

const EARTH_BASE = "/textures/earth-night.jpg";
const EARTH_RELIEF = "/textures/earth-topology.png";
const ATMOSPHERE_COLOR = "#4fd6c2";
const ATMOSPHERE_ALTITUDE = 0.18;

// -----------------------------------------------------------------------------
// CAMERA
// -----------------------------------------------------------------------------

const DEFAULT_VIEW = { lat: 8, lng: -40, altitude: 2.4 };

const MIN_ALTITUDE = 0.35;
const MAX_ALTITUDE = 4.0;

const ZOOM_IN_FACTOR = 0.68;
const ZOOM_OUT_FACTOR = 1.42;

const CAMERA_ANIMATION_MS = 700;
const RESET_ANIMATION_MS = 1200;
const SELECT_ANIMATION_MS = 1200;
const SELECT_ALTITUDE = 0.85;
const AUTO_ROTATE_SPEED = 0.18;

// -----------------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------------

type GlobeApi = {
  zoom: (direction: 1 | -1) => void;
  reset: () => void;
};

type Props = {
  events: OrbiEvent[];
  selected: OrbiEvent | null;
  onSelect: (event: OrbiEvent) => void;
  onReady?: (api: GlobeApi) => void;
};

type Controls = {
  autoRotate: boolean;
  autoRotateSpeed: number;
  enableZoom: boolean;
  enablePan: boolean;
};

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

function clampAltitude(value: number) {
  return Math.min(MAX_ALTITUDE, Math.max(MIN_ALTITUDE, value));
}

function categoryColor(event: OrbiEvent) {
  return CATEGORY_META[event.category]?.color ?? "#ffffff";
}

function categoryGlyph(event: OrbiEvent) {
  return CATEGORY_META[event.category]?.glyph ?? "•";
}

// -----------------------------------------------------------------------------
// COMPONENT
// -----------------------------------------------------------------------------

export default function GlobeView({ events, selected, onSelect, onReady }: Props) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const initialized = useRef(false);

  // ---------------------------------------------------------------------------
  // RESPONSIVE SIZE
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () =>
      setSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ---------------------------------------------------------------------------
  // GLOBE INITIALIZATION + PUBLIC API
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || initialized.current || size.width === 0) return;
    initialized.current = true;

    const controls = globe.controls() as unknown as Controls;
    controls.autoRotate = true;
    controls.autoRotateSpeed = AUTO_ROTATE_SPEED;
    controls.enableZoom = true;
    controls.enablePan = false;

    // Realce sutil do relevo — mantém a estética noturna sem achatar o globo.
    const material = (
      globe as unknown as { globeMaterial?: () => { bumpScale?: number } }
    ).globeMaterial?.();
    if (material && typeof material.bumpScale === "number") material.bumpScale = 8;

    globe.pointOfView(DEFAULT_VIEW, 0);

    onReadyRef.current?.({
      zoom: (direction) => {
        const pov = globe.pointOfView();
        const factor = direction === 1 ? ZOOM_IN_FACTOR : ZOOM_OUT_FACTOR;
        globe.pointOfView(
          { lat: pov.lat, lng: pov.lng, altitude: clampAltitude(pov.altitude * factor) },
          CAMERA_ANIMATION_MS,
        );
      },
      reset: () => {
        (globe.controls() as unknown as Controls).autoRotate = true;
        globe.pointOfView(DEFAULT_VIEW, RESET_ANIMATION_MS);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width > 0]);

  // ---------------------------------------------------------------------------
  // SELECTED OBSERVATION — aproxima suavemente e pausa a rotação
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !selected) return;
    (globe.controls() as unknown as Controls).autoRotate = false;
    globe.pointOfView(
      { lat: selected.lat, lng: selected.lng, altitude: SELECT_ALTITUDE },
      SELECT_ANIMATION_MS,
    );
  }, [selected]);

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  const priorityEvents = events.filter((e) => e.priority === 1);

  return (
    <div ref={wrapRef} className="h-full w-full">
      {size.width > 0 && (
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          rendererConfig={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          backgroundColor="rgba(0,0,0,0)"
          // Earth Base + Terrain
          globeImageUrl={EARTH_BASE}
          bumpImageUrl={EARTH_RELIEF}
          // Atmosphere
          atmosphereColor={ATMOSPHERE_COLOR}
          atmosphereAltitude={ATMOSPHERE_ALTITUDE}
          // Observation Layer — pontos
          pointsData={events}
          pointLat="lat"
          pointLng="lng"
          pointColor={(d: object) => categoryColor(d as OrbiEvent)}
          pointAltitude={(d: object) =>
            (d as OrbiEvent).id === selected?.id ? 0.13 : 0.045
          }
          pointRadius={(d: object) =>
            (d as OrbiEvent).id === selected?.id ? 0.42 : 0.25
          }
          pointsMerge={false}
          pointLabel={(d: object) =>
            `${categoryGlyph(d as OrbiEvent)} ${(d as OrbiEvent).place}`
          }
          onPointClick={(d: object) => onSelect(d as OrbiEvent)}
          // Observation Layer — anéis de prioridade
          ringsData={priorityEvents}
          ringLat="lat"
          ringLng="lng"
          ringColor={(d: object) => categoryColor(d as OrbiEvent)}
          ringMaxRadius={3.5}
          ringPropagationSpeed={1.2}
          ringRepeatPeriod={1600}
        />
      )}

      {/* Futuras camadas (não renderizam ainda):
          - AtmosphericLayer (Windy)
          - OceanLayer
          - WebcamLayer
          Existem conceitualmente para impedir acoplamento direto ao GlobeView. */}
    </div>
  );
}
