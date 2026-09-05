import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
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
// EARTH BASE — ciclo dia/noite com terminador solar em tempo real
// -----------------------------------------------------------------------------

const EARTH_DAY = "/textures/earth-day.jpg";
const EARTH_NIGHT = "/textures/earth-night.jpg";
const ATMOSPHERE_COLOR = "#63b3ff";
const ATMOSPHERE_ALTITUDE = 0.22;

const BORDER_COLOR = "rgba(120, 200, 220, 0.32)";
const LABEL_COLOR = "rgba(198, 226, 236, 0.72)";

const SUN_UPDATE_MS = 60_000; // recalcula a posição do sol a cada minuto

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
  flyTo: (lat: number, lng: number, altitude?: number) => void;
};

type Props = {
  events: OrbiEvent[];
  selected: OrbiEvent | null;
  onSelect: (event: OrbiEvent) => void;
  onReady?: (api: GlobeApi) => void;
  /** ponto focado pela busca de região */
  focus?: { lat: number; lng: number; name: string } | null;
  /** exibe fronteiras e nomes de países */
  showRegions?: boolean;
  onPickRegion?: (place: { lat: number; lng: number; name: string }) => void;
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
// SUN — posição sub-solar aproximada (lat/lng) e conversão para vetor 3D
// -----------------------------------------------------------------------------

function subSolarPoint(date: Date) {
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - yearStart) / 86_400_000);
  // declinação solar (aprox. de Cooper)
  const declination =
    -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10));
  // longitude sub-solar: 0° às 12:00 UTC, 15°/hora
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
  const longitude = 180 - utcHours * 15;
  return { lat: declination, lng: longitude };
}

// mesma convenção de coordenadas do three-globe (polar2Cartesian)
function latLngToVector3(lat: number, lng: number) {
  const phi = (lat * Math.PI) / 180;
  const theta = (lng * Math.PI) / 180;
  return new THREE.Vector3(
    Math.cos(phi) * Math.sin(theta),
    Math.sin(phi),
    Math.cos(phi) * Math.cos(theta),
  );
}

// -----------------------------------------------------------------------------
// DAY/NIGHT SHADER — mistura texturas de dia e noite pelo ângulo sol/superfície
// -----------------------------------------------------------------------------

const DAY_NIGHT_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec2 vUv;
  void main() {
    // normal em espaço de mundo (o globo não se move — a câmera orbita)
    vNormal = normalize(mat3(modelMatrix) * normal);
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const DAY_NIGHT_FRAGMENT = /* glsl */ `
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  uniform vec3 sunDirection;
  varying vec3 vNormal;
  varying vec2 vUv;
  void main() {
    // --- LADO DIA: mais claro e com oceanos mais azuis (Terra vista do espaço)
    vec3 day = texture2D(dayTexture, vUv).rgb;
    day = pow(day, vec3(0.82)) * 1.45;
    float ocean = clamp((day.b - day.r) * 2.2, 0.0, 1.0);
    day = mix(day, day * vec3(0.62, 0.95, 1.5), ocean * 0.75);
    day = min(day, vec3(1.0));

    // --- LADO NOITE: luzes urbanas bem mais vivas sobre um azul profundo
    vec3 raw = texture2D(nightTexture, vUv).rgb;
    float lum = dot(raw, vec3(0.299, 0.587, 0.114));
    vec3 lights = pow(raw, vec3(0.75)) * 3.2 * vec3(1.0, 0.84, 0.55) * smoothstep(0.02, 0.35, lum);
    vec3 nightBase = vec3(0.035, 0.075, 0.13) + raw * 0.6;
    vec3 night = nightBase + lights;

    float cosine = dot(normalize(vNormal), normalize(sunDirection));
    float mixAmount = smoothstep(-0.22, 0.32, cosine);
    vec3 color = mix(night, day, mixAmount);

    // brilho azulado no crepúsculo
    float twilight = 1.0 - abs(cosine * 4.0);
    color += vec3(0.06, 0.14, 0.26) * clamp(twilight, 0.0, 1.0) * 0.9;

    gl_FragColor = vec4(min(color, vec3(1.0)), 1.0);
  }
`;

function createDayNightMaterial(): THREE.ShaderMaterial {
  const loader = new THREE.TextureLoader();
  const dayTexture = loader.load(EARTH_DAY);
  const nightTexture = loader.load(EARTH_NIGHT);
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  nightTexture.colorSpace = THREE.SRGBColorSpace;
  dayTexture.anisotropy = 8;
  nightTexture.anisotropy = 8;

  return new THREE.ShaderMaterial({
    uniforms: {
      dayTexture: { value: dayTexture },
      nightTexture: { value: nightTexture },
      sunDirection: { value: new THREE.Vector3(1, 0, 0) },
    },
    vertexShader: DAY_NIGHT_VERTEX,
    fragmentShader: DAY_NIGHT_FRAGMENT,
  });
}

function updateSunDirection(material: THREE.ShaderMaterial) {
  const { lat, lng } = subSolarPoint(new Date());
  (material.uniforms["sunDirection"]!.value as THREE.Vector3).copy(
    latLngToVector3(lat, lng),
  );
}

// -----------------------------------------------------------------------------
// COMPONENT
// -----------------------------------------------------------------------------

type CountryLabel = { name: string; continent: string; lat: number; lng: number; size: number };

export default function GlobeView({
  events,
  selected,
  onSelect,
  onReady,
  focus,
  showRegions = true,
  onPickRegion,
}: Props) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const initialized = useRef(false);

  // Earth Base — material dia/noite com terminador solar em tempo real.
  // Criado uma única vez e passado via prop globeMaterial.
  const [material] = useState(() => createDayNightMaterial());

  // ---------------------------------------------------------------------------
  // SUN — recalcula a posição sub-solar periodicamente
  // ---------------------------------------------------------------------------

  useEffect(() => {
    updateSunDirection(material);
    const timer = setInterval(() => updateSunDirection(material), SUN_UPDATE_MS);
    return () => clearInterval(timer);
  }, [material]);

  // ---------------------------------------------------------------------------
  // REGIONS — fronteiras de países e rótulos
  // ---------------------------------------------------------------------------

  const [countries, setCountries] = useState<{ features: object[] }>({ features: [] });
  const [labels, setLabels] = useState<CountryLabel[]>([]);

  useEffect(() => {
    if (!showRegions || labels.length > 0) return;
    let alive = true;
    Promise.all([
      fetch("/geo/countries.geo.json").then((r) => r.json()),
      fetch("/geo/country-labels.json").then((r) => r.json()),
    ])
      .then(([geo, lbl]) => {
        if (!alive) return;
        setCountries(geo as { features: object[] });
        setLabels(lbl as CountryLabel[]);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [showRegions, labels.length]);

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
      flyTo: (lat, lng, altitude = SELECT_ALTITUDE) => {
        (globe.controls() as unknown as Controls).autoRotate = false;
        globe.pointOfView({ lat, lng, altitude: clampAltitude(altitude) }, SELECT_ANIMATION_MS);
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

  // FOCUS — ponto escolhido na busca de região
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !focus) return;
    (globe.controls() as unknown as Controls).autoRotate = false;
    globe.pointOfView(
      { lat: focus.lat, lng: focus.lng, altitude: 1.2 },
      SELECT_ANIMATION_MS,
    );
  }, [focus]);

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  const priorityEvents = events.filter((e) => e.priority === 1);
  const focusRings: { lat: number; lng: number; category?: string }[] = focus
    ? [...priorityEvents, { lat: focus.lat, lng: focus.lng }]
    : priorityEvents;

  return (
    <div ref={wrapRef} className="h-full w-full">
      {size.width > 0 && (
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          rendererConfig={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          backgroundColor="rgba(0,0,0,0)"
          // Earth Base — dia/noite com terminador solar em tempo real
          globeMaterial={material}
          // Atmosphere
          atmosphereColor={ATMOSPHERE_COLOR}
          atmosphereAltitude={ATMOSPHERE_ALTITUDE}
          // Region Layer — fronteiras e nomes
          polygonsData={showRegions ? countries.features : []}
          polygonAltitude={0.006}
          polygonCapColor={() => "rgba(0,0,0,0)"}
          polygonSideColor={() => "rgba(0,0,0,0)"}
          polygonStrokeColor={() => BORDER_COLOR}
          polygonLabel={(d: object) =>
            `<span style="font-size:11px">${((d as { properties?: { name?: string } }).properties?.name ?? "")}</span>`
          }
          onPolygonClick={(d: object) => {
            const props = (d as { properties?: { name?: string } }).properties;
            const label = labels.find((l) => l.name === props?.name);
            if (label && onPickRegion)
              onPickRegion({ lat: label.lat, lng: label.lng, name: label.name });
          }}
          polygonsTransitionDuration={0}
          // Region Layer — rótulos
          labelsData={showRegions ? labels.filter((l) => l.size > 2) : []}
          labelLat="lat"
          labelLng="lng"
          labelText="name"
          labelSize={(d: object) => Math.min(1.1, 0.32 + Math.log10((d as CountryLabel).size + 1) * 0.35)}
          labelDotRadius={0}
          labelColor={() => LABEL_COLOR}
          labelResolution={2}
          labelAltitude={0.008}
          onLabelClick={(d: object) => {
            const l = d as CountryLabel;
            onPickRegion?.({ lat: l.lat, lng: l.lng, name: l.name });
          }}
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
          ringsData={focusRings}
          ringLat="lat"
          ringLng="lng"
          ringColor={(d: object) =>
            (d as OrbiEvent).category ? categoryColor(d as OrbiEvent) : "#63b3ff"
          }
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
