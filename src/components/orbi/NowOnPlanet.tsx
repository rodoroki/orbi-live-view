import { CATEGORY_META, type OrbiEvent } from "@/lib/orbi-events";
import { useTranslation } from "@/lib/i18n";
import { distanceKm } from "@/lib/intelligence";

/**
 * ORBI — Discovery mínima: "Agora no planeta".
 * Três sinais relevantes, sem feed e sem parede de cards.
 */
export default function NowOnPlanet({
  events,
  origin,
  onSelect,
}: {
  events: OrbiEvent[];
  /** posição do observador — muda o título para "perto de você" */
  origin?: { lat: number; lng: number } | null;
  onSelect: (event: OrbiEvent) => void;
}) {
  const { t } = useTranslation();
  if (events.length === 0) return null;

  const near = origin != null && events.some((e) => distanceKm(origin, e) < 1500);

  return (
    <div className="pointer-events-none absolute left-4 top-24 z-10 hidden flex-col gap-2 lg:flex">
      <span className="label-track text-[9px] text-muted-foreground/60">
        {near ? t.insight.nearYou : t.planet.nowOnPlanet}
      </span>
      <div className="pointer-events-auto flex flex-col gap-1.5">
        {events.slice(0, 3).map((event) => {
          const meta = CATEGORY_META[event.category];
          return (
            <button
              key={event.id}
              type="button"
              onClick={() => onSelect(event)}
              className="focus-ring group flex items-center gap-2 rounded-full border border-border/50 bg-background/40 px-3 py-1.5 backdrop-blur transition-colors duration-300 hover:border-primary/40"
            >
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: meta?.color ?? "var(--primary)" }}
              />
              <span className="max-w-[11rem] truncate text-[11px] font-light text-foreground/85">
                {event.place}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
