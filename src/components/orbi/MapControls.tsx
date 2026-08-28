import { Link } from "@tanstack/react-router";
import {
  Globe2,
  Activity,
  Clock,
  Info,
  Plus,
  Minus,
  Crosshair,
  Layers,
  SlidersHorizontal,
  List,
  X,
} from "lucide-react";
import { CATEGORY_META, type EventCategory, type OrbiEvent } from "@/lib/orbi-events";
import { useTranslation } from "@/lib/i18n";

export function ToolRail() {
  const { t } = useTranslation();
  
  const tools = [
    { label: t.common.map, to: "/", icon: Globe2 },
    { label: t.nav.events, to: "/eventos", icon: Activity },
    { label: t.nav.timeline, to: "/timeline", icon: Clock },
    { label: t.common.about, to: "/sobre", icon: Info },
  ] as const;

  return (
    <div className="surface-panel absolute left-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col rounded-full p-1.5 md:flex">
      {tools.map((t) => (
        <Link
          key={t.to}
          to={t.to}
          title={t.label}
          aria-label={t.label}
          activeOptions={{ exact: t.to === "/" }}
          className="focus-ring flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground active:scale-95 data-[status=active]:text-primary"
        >
          <t.icon className="h-4 w-4" strokeWidth={1.4} />
        </Link>
      ))}
    </div>
  );
}

const iconBtn =
  "focus-ring flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground active:scale-95 md:h-10 md:w-10";

export function MapTools({
  onZoom,
  onReset,
  onToggleFilters,
  filtersOpen,
  onToggleLayers,
  layersOpen,
  onToggleEvents,
  eventsOpen,
  onToggleConditions,
  conditionsOpen,
}: {
  onZoom: (direction: 1 | -1) => void;
  onReset: () => void;
  onToggleFilters: () => void;
  filtersOpen: boolean;
  onToggleLayers: () => void;
  layersOpen: boolean;
  onToggleEvents?: () => void;
  eventsOpen?: boolean;
  onToggleConditions?: () => void;
  conditionsOpen?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="surface-panel absolute bottom-20 right-3 z-10 flex flex-col rounded-full p-1.5 md:bottom-24 md:right-6">
      {onToggleConditions && (
        <button
          type="button"
          aria-label={conditionsOpen ? t.conditions.close : t.conditions.open}
          title={t.conditions.title}
          aria-pressed={conditionsOpen}
          className={`${iconBtn} ${conditionsOpen ? "text-primary" : ""}`}
          onClick={onToggleConditions}
        >
          <Wind className="h-4 w-4" strokeWidth={1.4} />
        </button>
      )}
      {onToggleEvents && (
        <button
          type="button"
          aria-label={eventsOpen ? t.events.closePanel : t.events.openPanel}
          aria-pressed={eventsOpen}
          className={`${iconBtn} ${eventsOpen ? "text-primary" : ""}`}
          onClick={onToggleEvents}
        >
          <List className="h-4 w-4" strokeWidth={1.4} />
        </button>
      )}
      <button type="button" aria-label={t.map.zoomIn} className={iconBtn} onClick={() => onZoom(1)}>
        <Plus className="h-4 w-4" strokeWidth={1.4} />
      </button>
      <button type="button" aria-label={t.map.zoomOut} className={iconBtn} onClick={() => onZoom(-1)}>
        <Minus className="h-4 w-4" strokeWidth={1.4} />
      </button>
      <button type="button" aria-label={t.map.reset} className={iconBtn} onClick={onReset}>
        <Crosshair className="h-4 w-4" strokeWidth={1.4} />
      </button>

      <button
        type="button"
        aria-label={t.map.layers}
        title={t.map.layers}
        aria-pressed={layersOpen}
        className={`${iconBtn} ${layersOpen ? "text-primary" : ""}`}
        onClick={onToggleLayers}
      >
        <Layers className="h-4 w-4" strokeWidth={1.4} />
      </button>
      <button
        type="button"
        aria-label={t.map.filters}
        title={t.map.filters}
        aria-pressed={filtersOpen}
        className={`${iconBtn} ${filtersOpen ? "text-primary" : ""}`}
        onClick={onToggleFilters}
      >
        <SlidersHorizontal className="h-4 w-4" strokeWidth={1.4} />
      </button>
    </div>
  );
}

export function ViewToggle({
  mode,
  onChange,
}: {
  mode: "flat" | "globe";
  onChange: (mode: "flat" | "globe") => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="surface-panel absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full p-1 md:bottom-6 md:p-1.5">
      <button
        type="button"
        onClick={() => onChange("flat")}
        className={`label-track focus-ring rounded-full px-3.5 py-1.5 text-[10px] transition-colors duration-200 md:px-4 md:py-2 ${
          mode === "flat"
            ? "bg-accent text-primary"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {t.common.map}
      </button>
      <button
        type="button"
        onClick={() => onChange("globe")}
        className={`label-track focus-ring rounded-full px-3.5 py-1.5 text-[10px] transition-colors duration-200 md:px-4 md:py-2 ${
          mode === "globe"
            ? "bg-accent text-primary"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {t.common.globe}
      </button>
    </div>
  );
}

export function CategoryFilters({
  active,
  onToggle,
}: {
  active: EventCategory[];
  onToggle: (category: EventCategory) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="surface-panel absolute inset-x-3 bottom-20 z-10 grid grid-cols-2 gap-1 rounded-md p-2 animate-sheet-up md:inset-x-auto md:bottom-6 md:left-6 md:flex md:flex-col md:animate-rise">
      {(Object.keys(CATEGORY_META) as EventCategory[]).map((key) => {
        const meta = CATEGORY_META[key];
        const on = active.includes(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => onToggle(key)}
            className={`focus-ring flex items-center gap-2.5 rounded-sm px-2.5 py-1.5 transition-colors duration-200 ${
              on ? "text-foreground" : "text-muted-foreground/50"
            } hover:bg-accent`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: on ? meta.color : "transparent",
                border: `1px solid ${meta.color}`,
              }}
            />
            <span className="label-track">{t.categories[key as keyof typeof t.categories] || meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ContextCard({
  event,
  total,
  onClose,
}: {
  event: OrbiEvent | null;
  total: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="surface-panel absolute inset-x-3 bottom-20 z-10 rounded-md p-4 animate-sheet-up md:inset-x-auto md:bottom-auto md:right-6 md:top-24 md:w-72 md:p-5 md:animate-rise">
      <div className="flex items-start justify-between">
        <div>
          <p className="label-track text-primary">
            {event ? (t.categories[event.category as keyof typeof t.categories] || CATEGORY_META[event.category].label) : t.eventDetails.details}
          </p>
          <h2 className="mt-2 text-base font-medium tracking-tight">
            {event ? event.title : t.common.explore}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar painel"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" strokeWidth={1.4} />
        </button>
      </div>

      {event ? (
        <div className="mt-5 flex flex-col gap-2.5">
          <Row label={t.eventDetails.location} value={event.place} />
          <Row
            label="Coord."
            value={`${event.lat.toFixed(1)}, ${event.lng.toFixed(1)}`}
          />
          <Row label={t.eventDetails.magnitude} value={event.magnitude} />
          <Row label={t.eventDetails.updated} value={event.updated} />
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-2.5">
          <Row label={t.nav.events} value={String(total)} />
          <Row label={t.eventDetails.sources} value="6" />
          <Row label={t.eventDetails.updated} value="00:12 UTC" />
        </div>
      )}

      <p className="label-track mt-6 border-t border-border pt-4 text-[9px] text-muted-foreground/70">
        {t.common.simulatedData}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="label-track text-muted-foreground">{label}</span>
      <span className="text-right font-mono text-xs text-foreground">{value}</span>
    </div>
  );
}

export type MapLayer = "base" | "events" | "atmosphere" | "ocean";

export const MAP_LAYERS: MapLayer[] = ["base", "events", "atmosphere", "ocean"];

export function LayersPanel({
  active,
  onToggle,
}: {
  active: MapLayer[];
  onToggle: (layer: MapLayer) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="surface-panel absolute inset-x-3 bottom-20 z-10 rounded-md p-3 animate-sheet-up md:inset-x-auto md:bottom-24 md:right-24 md:w-48 md:animate-rise">
      <p className="label-track px-1 pb-2 text-muted-foreground">{t.layers.title}</p>
      <div className="flex flex-col">
        {MAP_LAYERS.map((layer) => {
          const on = active.includes(layer);
          return (
            <button
              key={layer}
              type="button"
              role="switch"
              aria-checked={on}
              onClick={() => onToggle(layer)}
              className={`focus-ring flex items-center justify-between gap-3 rounded-sm px-1.5 py-1.5 transition-colors duration-200 hover:bg-accent ${
                on ? "text-foreground" : "text-muted-foreground/50"
              }`}
            >
              <span className="label-track">{t.layers[layer]}</span>
              <span
                className={`relative h-3.5 w-6 rounded-full border transition-colors ${
                  on ? "border-primary/60 bg-primary/25" : "border-border bg-transparent"
                }`}
              >
                <span
                  className={`absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full transition-all ${
                    on ? "left-3 bg-primary" : "left-0.5 bg-muted-foreground/60"
                  }`}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
