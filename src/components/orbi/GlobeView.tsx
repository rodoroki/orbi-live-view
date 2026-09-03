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
const ATMOSPHERE_COLOR = "#4fd6c2";
const ATMOSPHERE_ALTITUDE = 0.18;

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
    vec3 dayColor = texture2D(dayTexture, vUv).rgb;
    // realça as luzes urbanas no lado noturno
    vec3 nightColor = texture2D(nightTexture, vUv).rgb * 1.35;
    float cosine = dot(normalize(vNormal), normalize(sunDirection));
    // penumbra suave no terminador (crepúsculo)
    float mixAmount = smoothstep(-0.15, 0.25, cosine);
    vec3 color = mix(nightColor, dayColor, mixAmount);
    gl_FragColor = vec4(color, 1.0);
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
  (material.uniforms.sunDirection.value as THREE.Vector3).copy(
    latLngToVector3(lat, lng),
  );
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
