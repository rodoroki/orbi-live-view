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
              className={`focus-ring group absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-transform duration-200 hover:z-20 hover:scale-125 ${
                active ? "z-20" : "z-10"
              }`}
              style={{ left: `${pos.left}%`, top: `${pos.top}%` }}
            >
              <span
                className="absolute inset-0 rounded-full opacity-25"
                style={{ background: `radial-gradient(circle, ${meta.color} 0%, transparent 70%)` }}
              />
              <span
                className="relative block rounded-full border border-white/50"
                style={{
                  width: active ? 7 : 5,
                  height: active ? 7 : 5,
                  backgroundColor: meta.color,
                  boxShadow: `0 0 ${active ? 12 : 6}px ${meta.color}`,
                }}
              />
              <span
                className={`pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full border border-border/60 bg-background/90 px-2 py-0.5 text-[10px] font-medium leading-none text-foreground backdrop-blur-md transition-opacity duration-200 ${
                  active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
              >
                {event.place}
              </span>
            </button>

          );
        })}
      </div>
    </div>
  );
}
