import { CATEGORY_META, type OrbiEvent } from "@/lib/orbi-events";
import { useTranslation } from "@/lib/i18n";


const EARTH_NIGHT = "/textures/earth-night.jpg";

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
              className={`focus-ring group absolute flex max-w-36 -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border px-2 py-1 shadow-lg backdrop-blur-md transition-all duration-200 hover:z-20 hover:scale-105 ${
                active
                  ? "z-20 border-primary/70 bg-background/95 text-foreground"
                  : "z-10 border-border/70 bg-background/80 text-foreground/90"
              }`}
              style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
            >
              <span
                className="block h-1.5 w-1.5 shrink-0 rounded-full transition-all"
                style={{
                  backgroundColor: meta.color,
                  boxShadow: `0 0 ${active ? 14 : 8}px ${meta.color}`,
                }}
              />
              <span className="truncate text-[10px] font-medium leading-none">
                {event.place}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
