import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowLeft, X } from "lucide-react";
import { CATEGORY_META, type OrbiEvent } from "@/lib/orbi-events";
import { format, useTranslation } from "@/lib/i18n";
import { buildInsight, eventHook, nextRelatedEvent } from "@/lib/intelligence";

/**
 * ORBI — Discovery: descobrir → entender → explorar.
 * O gancho é derivado deterministicamente da categoria do evento real.
 */
export default function DiscoveryCard({
  event,
  events = [],
  onSelect,
  onFocus,
  onClose,
}: {
  event: OrbiEvent;
  events?: OrbiEvent[];
  onSelect?: (event: OrbiEvent) => void;
  onFocus?: (event: OrbiEvent) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [deep, setDeep] = useState(false);

  useEffect(() => {
    setDeep(false);
  }, [event.id]);

  const insight = useMemo(() => buildInsight(event, events, t), [event, events, t]);
  const next = useMemo(() => nextRelatedEvent(event, events), [event, events]);

  const color = CATEGORY_META[event.category]?.color ?? "var(--primary)";
  const phenomenon =
    t.discovery.phenomena[event.category as keyof typeof t.discovery.phenomena] ??
    CATEGORY_META[event.category]?.label ??
    "";

  const minutes = event.detectedMinutesAgo;
  const elapsed =
    minutes < 60
      ? `${minutes} min`
      : minutes < 1440
        ? `${Math.round(minutes / 60)} h`
        : `${Math.round(minutes / 1440)} d`;

  const linkCls =
    "focus-ring label-track group flex min-h-9 items-center gap-2 text-[10px] transition-opacity duration-300 hover:opacity-70";

  return (
    <div className="surface-panel absolute inset-x-3 bottom-20 z-20 rounded-md p-5 animate-sheet-up md:inset-x-auto md:bottom-auto md:right-6 md:top-24 md:w-[19rem] md:p-6 md:animate-rise">
      <button
        type="button"
        onClick={onClose}
        aria-label={t.common.close}
        className="focus-ring absolute right-3 top-3 rounded-sm p-1.5 text-muted-foreground/60 transition-colors duration-300 hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" strokeWidth={1.4} />
      </button>

      {!deep ? (
        <div className="animate-fade-in" aria-live="polite">
          <span className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full motion-safe:animate-pulse"
              style={{ backgroundColor: color }}
            />
            <span className="label-track text-[9px] text-discovery">{t.discovery.lookAtThis}</span>
          </span>

          <p className="mt-3 pr-6 text-base font-light leading-snug text-foreground">
            {eventHook(event, t)}
          </p>
          <h2 className="label-track mt-4 text-[11px] text-foreground/90">
            {(event.place?.trim() || t.eventDetails.locationUnavailable).toUpperCase()}
          </h2>
          <p className="mt-1 text-sm font-light leading-snug text-muted-foreground">{phenomenon}</p>
          <p className="label-track mt-3 text-[9px] text-muted-foreground/60">
            {format(t.discovery.detected, { time: elapsed })}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5">
            <button type="button" onClick={() => setDeep(true)} className={`${linkCls} text-primary`}>
              {t.discovery.discover}
              <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.4} />
            </button>
            {onFocus && (
              <button type="button" onClick={() => onFocus(event)} className={`${linkCls} text-muted-foreground`}>
                {t.discovery.seeOnPlanet}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          <p className="label-track text-[9px] text-primary">{t.insight.title}</p>
          <h3 className="mt-4 text-sm font-light leading-snug text-foreground">{insight.headline}</h3>
          <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">{insight.summary}</p>

          <p className="label-track mt-6 text-[9px] text-muted-foreground/60">{t.insight.whatWeKnow}</p>
          <div className="mt-3 flex flex-col gap-2.5">
            {insight.facts.map((fact) => (
              <Row key={fact.label} label={fact.label} value={fact.value} />
            ))}
          </div>

          <p className="label-track mt-6 text-[9px] text-muted-foreground/60">{t.insight.context}</p>
          <p className="mt-2 text-xs font-light leading-relaxed text-muted-foreground">{insight.context}</p>

          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <span className="label-track text-[9px] text-muted-foreground/50">{t.insight.source}</span>
            {insight.sources.map((s) => (
              <span
                key={s}
                className="label-track rounded-full border border-border/60 px-2.5 py-1 text-[9px] text-muted-foreground/70"
              >
                {s}
              </span>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4">
            <button type="button" onClick={() => setDeep(false)} className={`${linkCls} text-muted-foreground`}>
              <ArrowLeft className="h-3 w-3" strokeWidth={1.4} />
              {t.discovery.back}
            </button>
            {onFocus && (
              <button type="button" onClick={() => onFocus(event)} className={`${linkCls} text-muted-foreground`}>
                {t.discovery.exploreRegion}
              </button>
            )}
            {next && onSelect && (
              <button type="button" onClick={() => onSelect(next)} className={`${linkCls} text-primary`}>
                {t.insight.nextDiscovery}
                <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.4} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="label-track text-[9px] text-muted-foreground/70">{label}</span>
      <span className="text-right font-mono text-xs text-foreground/90">{value}</span>
    </div>
  );
}
