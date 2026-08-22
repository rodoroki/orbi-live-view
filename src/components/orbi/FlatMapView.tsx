import { CATEGORY_META, type OrbiEvent } from "@/lib/orbi-events";
import { useTranslation } from "@/lib/i18n";


const EARTH_NIGHT = "https://unpkg.com/three-globe/example/img/earth-night.jpg";

type Props = {
  events: OrbiEvent[];
  selected: OrbiEvent | null;
  onSelect: (event: OrbiEvent) => void;
};

/** Projeção equirretangular simples — lat/lng para posição percentual. */
function project(lat: number, lng: number) {
  return { left: ((lng + 180) / 360) * 100, top: ((90 - lat) / 180) * 100 };
}

export default function FlatMapView({ events, selected, onSelect }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div
        className="relative w-full max-w-[1600px]"
        style={{ aspectRatio: "2 / 1" }}
      >
        <img
          src={EARTH_NIGHT}
          alt="Mapa mundial noturno"
          className="h-full w-full object-cover opacity-90"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, transparent 45%, var(--void) 100%)",
          }}
        />
        {events.map((event) => {
          const pos = project(event.lat, event.lng);
          const meta = CATEGORY_META[event.category];
          const active = selected?.id === event.id;
          return (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelect(event)}
              aria-label={`${t.categories[event.category as keyof typeof t.categories] || meta.label} · ${event.place}`}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
            >
              <span
                className="block rounded-full transition-all"
                style={{
                  width: active ? 14 : 9,
                  height: active ? 14 : 9,
                  backgroundColor: meta.color,
                  boxShadow: `0 0 ${active ? 22 : 12}px ${meta.color}`,
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
