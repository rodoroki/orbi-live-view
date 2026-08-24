import { useEffect, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { CATEGORY_META, type OrbiEvent } from "@/lib/orbi-events";

const EARTH_NIGHT = "/textures/earth-night.jpg";
const EARTH_TOPO = "/textures/earth-topology.png";

type GlobeApi = { zoom: (direction: 1 | -1) => void; reset: () => void };

type Props = {
  events: OrbiEvent[];
  selected: OrbiEvent | null;
  onSelect: (event: OrbiEvent) => void;
  onReady?: (api: GlobeApi) => void;
};

const DEFAULT_VIEW = { lat: 8, lng: -40, altitude: 2.4 };

export default function GlobeView({ events, selected, onSelect, onReady }: Props) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const initialized = useRef(false);

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

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || initialized.current) return;
    initialized.current = true;
    const controls = globe.controls() as unknown as {
      autoRotate: boolean;
      autoRotateSpeed: number;
      enableZoom: boolean;
    };
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.25;
    controls.enableZoom = true;
    globe.pointOfView(DEFAULT_VIEW, 0);

    onReadyRef.current?.({
      zoom: (direction) => {
        const pov = globe.pointOfView();
        const altitude = Math.min(
          4,
          Math.max(0.35, pov.altitude * (direction === 1 ? 0.7 : 1.4)),
        );
        globe.pointOfView({ ...pov, altitude }, 600);
      },
      reset: () => {
        (globe.controls() as unknown as { autoRotate: boolean }).autoRotate = true;
        globe.pointOfView(DEFAULT_VIEW, 1200);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width > 0]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !selected) return;
    const controls = globe.controls() as unknown as { autoRotate: boolean };
    controls.autoRotate = false;
    globe.pointOfView(
      { lat: selected.lat, lng: selected.lng, altitude: 1.1 },
      1400,
    );
  }, [selected]);

  return (
    <div ref={wrapRef} className="h-full w-full">
      {size.width > 0 && (
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor="rgba(0,0,0,0)"
          globeImageUrl={EARTH_NIGHT}
          bumpImageUrl={EARTH_TOPO}
          atmosphereColor="#4fd6c2"
          atmosphereAltitude={0.18}
          pointsData={events}
          pointLat="lat"
          pointLng="lng"
          pointColor={(d: object) => CATEGORY_META[(d as OrbiEvent).category].color}
          pointAltitude={(d: object) =>
            (d as OrbiEvent).id === selected?.id ? 0.12 : 0.045
          }
          pointRadius={(d: object) => ((d as OrbiEvent).id === selected?.id ? 0.42 : 0.28)}
          pointsMerge={false}
          pointLabel={(d: object) =>
            `${CATEGORY_META[(d as OrbiEvent).category].glyph} ${(d as OrbiEvent).place}`
          }
          onPointClick={(d: object) => onSelect(d as OrbiEvent)}
          ringsData={events.filter((e) => e.priority === 1)}
          ringLat="lat"
          ringLng="lng"
          ringColor={(d: object) => CATEGORY_META[(d as OrbiEvent).category].color}
          ringMaxRadius={4}
          ringPropagationSpeed={1.4}
          ringRepeatPeriod={1400}
        />
      )}
    </div>
  );
}
