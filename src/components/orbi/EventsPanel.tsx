import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import {
  CATEGORY_META,
  PERIODS,
  PERIOD_MINUTES,
  REGIONS,
  SEVERITY_META,
  type EventCategory,
  type EventSeverity,
  type OrbiEvent,
  type OrbiPeriod,
  type OrbiRegion,
} from "@/lib/orbi-events";
import { format, useTranslation } from "@/lib/i18n";

const SEVERITIES: EventSeverity[] = ["critical", "high", "moderate", "low"];
const ALL_CATEGORIES = Object.keys(CATEGORY_META) as EventCategory[];

type Props = {
  events: OrbiEvent[];
  selected: OrbiEvent | null;
  onSelect: (event: OrbiEvent) => void;
  onClose: () => void;
};

export default function EventsPanel({ events, selected, onSelect, onClose }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<EventCategory | "all">("all");
  const [region, setRegion] = useState<OrbiRegion | "all">("all");
  const [severity, setSeverity] = useState<EventSeverity | "all">("all");
  const [period, setPeriod] = useState<OrbiPeriod>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events
      .filter((e) => (category === "all" ? true : e.category === category))
      .filter((e) => (region === "all" ? true : e.region === region))
      .filter((e) => (severity === "all" ? true : e.severity === severity))
      .filter((e) => e.detectedMinutesAgo <= PERIOD_MINUTES[period])
      .filter(
        (e) =>
          !q ||
          e.title.toLowerCase().includes(q) ||
          e.place.toLowerCase().includes(q) ||
          (t.categories[e.category] ?? "").toLowerCase().includes(q),
      )
      .sort(
        (a, b) =>
          SEVERITY_META[b.severity].rank - SEVERITY_META[a.severity].rank ||
          a.detectedMinutesAgo - b.detectedMinutesAgo,
      );
  }, [events, query, category, region, severity, period, t]);

  return (
    <aside className="surface-panel absolute inset-x-3 bottom-20 z-20 flex max-h-[72vh] flex-col overflow-hidden rounded-md animate-sheet-up md:inset-x-auto md:bottom-24 md:left-20 md:top-20 md:z-10 md:max-h-none md:w-[300px] md:animate-rise">
      <div className="flex shrink-0 items-start justify-between px-5 pt-5">
        <p className="label-track text-primary">{t.events.panelTitle}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.events.closePanel}
          className="focus-ring -m-2 rounded-sm p-2 text-muted-foreground transition-colors duration-200 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.4} />
        </button>
      </div>

      {/* search */}
      <div className="mt-5 shrink-0 px-5">
        <div className="flex items-center gap-2 rounded-sm border border-border/60 bg-background/40 px-2.5 py-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.4} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.events.searchPlaceholder}
            className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground/70"
          />
        </div>
      </div>

      {/* filters */}
      <div className="mt-4 flex shrink-0 flex-col gap-3 px-5">
        <FilterRow
          label={t.events.category}
          options={[
            { key: "all", label: t.common.all },
            ...ALL_CATEGORIES.map((c) => ({
              key: c,
              label: t.categories[c],
              dot: CATEGORY_META[c].color,
            })),
          ]}
          value={category}
          onChange={(v) => setCategory(v as EventCategory | "all")}
        />
        <FilterRow
          label={t.events.period}
          options={PERIODS.map((p) => ({
            key: p,
            label: p === "all" ? t.common.all : t.periods[p],
          }))}
          value={period}
          onChange={(v) => setPeriod(v as OrbiPeriod)}
        />
        <FilterRow
          label={t.events.severity}
          options={[
            { key: "all", label: t.common.all },
            ...SEVERITIES.map((s) => ({ key: s, label: t.severity[s] })),
          ]}
          value={severity}
          onChange={(v) => setSeverity(v as EventSeverity | "all")}
        />
        <FilterRow
          label={t.events.region}
          options={[
            { key: "all", label: t.common.all },
            ...REGIONS.map((r) => ({ key: r, label: t.regions[r] })),
          ]}
          value={region}
          onChange={(v) => setRegion(v as OrbiRegion | "all")}
        />
      </div>

      {/* list */}
      <div className="mt-5 flex shrink-0 items-baseline justify-between border-t border-border/60 px-5 pt-4">

        <p className="label-track text-muted-foreground">{t.events.recent}</p>
        <span className="font-mono text-[10px] text-muted-foreground/70">
          {format(t.events.resultCount, { count: filtered.length })}
        </span>
      </div>

      <div className="mt-1 min-h-[10rem] flex-1 overflow-y-auto px-5 pb-5">
        {filtered.length === 0 ? (
          <p className="py-6 text-xs text-muted-foreground/70">{t.events.noResults}</p>
        ) : (
          <ul className="-mx-2 flex flex-col">
            {filtered.map((event) => {
              const sev = SEVERITY_META[event.severity];
              const active = selected?.id === event.id;
              return (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(event)}
                    className={`focus-ring w-full border-b border-border/40 px-2 py-3 text-left transition-colors duration-200 ${
                      active
                        ? "bg-accent/50 text-foreground"
                        : "text-foreground/90 hover:bg-accent/30"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className="mt-1.5 h-3 w-[2px] shrink-0 rounded-full"
                        style={{ backgroundColor: sev.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium tracking-tight">
                          {event.title}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {event.place}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                          <span style={{ color: sev.color }}>
                            {t.severity[event.severity]}
                          </span>
                          <span className="h-2.5 w-px bg-border" />
                          <span className="text-muted-foreground">
                            {t.categories[event.category]}
                          </span>
                          <span className="ml-auto text-muted-foreground/70">
                            {event.updated}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: string; label: string; dot?: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="label-track text-[10px] text-muted-foreground/80">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={`focus-ring flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] transition-colors duration-200 ${
              value === option.key
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.dot && (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: option.dot }}
              />
            )}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
