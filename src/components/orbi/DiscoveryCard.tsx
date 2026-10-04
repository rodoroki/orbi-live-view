import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowLeft, X } from "lucide-react";
import { CATEGORY_META, type OrbiEvent } from "@/lib/orbi-events";
import { format, useTranslation } from "@/lib/i18n";
import { buildInsight, eventHook } from "@/lib/intelligence";
import {
  getNearbyDiscoveries,
  getNextDiscovery,
  historyHourFor,
} from "@/lib/exploration/discovery";

/**
 * ORBI — Discovery: o que estou vendo → o que posso descobrir aqui → entender → explorar.
 * Toda ação só aparece quando há dado real por trás dela.
 */
export default function DiscoveryCard({
  event,
  events = [],
  visited = [],
  previous,
  following = false,
  inHistory = false,
  onSelect,
  onFocus,
  onFollow,
  onBack,
  onCameras,
  onWeather,
  onHistory,
  onClose,
}: {
  event: OrbiEvent;
  events?: OrbiEvent[];
  visited?: string[];
  previous?: OrbiEvent | null;
  following?: boolean;
  inHistory?: boolean;
  onSelect?: (event: OrbiEvent) => void;
  onFocus?: ((event: OrbiEvent) => void) | undefined;
  onFollow?: (event: OrbiEvent) => void;
  onBack?: () => void;
  onCameras?: () => void;
  onWeather?: () => void;
  onHistory?: (hour: number | 0) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const x = t.exploration;
  const [deep, setDeep] = useState(false);

  useEffect(() => {
    setDeep(false);
  }, [event.id]);

  const insight = useMemo(() => buildInsight(event, events, t), [event, events, t]);
  const nearby = useMemo(() => getNearbyDiscoveries(event, events), [event, events]);
  const next = useMemo(() => getNextDiscovery(event, events, visited), [event, events, visited]);
  const historyHour = historyHourFor(event);

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
    "focus-ring label-track group flex min-h-11 h-auto items-center gap-2 bg-transparent px-0 text-xs transition-opacity duration-300 hover:bg-transparent hover:opacity-70";
  const placeName = event.place?.trim() || t.eventDetails.locationUnavailable;

  return (
    <div
      role="dialog"
      aria-label={placeName}
      className="orbi-sheet surface-panel absolute inset-x-3 bottom-20 z-20 rounded-md p-5 animate-sheet-up md:inset-x-auto md:bottom-auto md:right-6 md:top-24 md:max-h-[calc(100vh-8rem)] md:w-[19rem] md:overflow-y-auto md:p-6 md:animate-rise"
    >
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={onClose}
        aria-label={t.common.close}
        className="focus-ring absolute right-1 top-1 h-11 w-11 rounded-sm p-1.5 text-muted-foreground transition-colors duration-300 hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" strokeWidth={1.4} />
      </Button>

      {previous && onBack && (
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={onBack}
          className={`${linkCls} -mt-3 mb-1 max-w-[85%] text-muted-foreground`}
        >
          <ArrowLeft className="h-3 w-3 shrink-0" strokeWidth={1.4} />
          <span className="truncate">{format(x.backTo, { place: previous.place })}</span>
        </Button>
      )}

      {!deep ? (
        <div className="animate-fade-in" aria-live="polite">
          <span className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full motion-safe:animate-pulse"
              style={{ backgroundColor: color }}
              aria-hidden
            />
            <span className="label-track text-[11px] text-discovery">{t.discovery.lookAtThis}</span>
          </span>

          <p className="mt-3 pr-6 text-base font-light leading-snug text-foreground">
            {eventHook(event, t)}
          </p>
          <h2 className="label-track mt-4 text-[11px] text-foreground/90">
            {placeName.toUpperCase()}
          </h2>
          <p className="mt-1 text-sm font-light leading-snug text-muted-foreground">{phenomenon}</p>
          <p className="label-track mt-3 text-[11px] text-muted-foreground">
            {format(t.discovery.detected, { time: elapsed })}
          </p>

          <p className="label-track mt-5 text-[11px] text-muted-foreground">{x.whatHere}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-5">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setDeep(true)}
              className={`${linkCls} text-primary`}
            >
              {t.discovery.discover}
              <ArrowRight
                className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={1.4}
              />
            </Button>
            {onFollow && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                aria-pressed={following}
                onClick={() => onFollow(event)}
                className={`${linkCls} ${following ? "text-discovery" : "text-muted-foreground"}`}
              >
                {following ? x.following : x.follow}
              </Button>
            )}
            {onFocus && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => onFocus(event)}
                className={`${linkCls} text-muted-foreground`}
              >
                {t.discovery.seeOnPlanet}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          <p className="label-track text-[11px] text-primary">{t.insight.title}</p>
          <h3 className="mt-4 text-sm font-light leading-snug text-foreground">
            {insight.headline}
          </h3>
          <p className="mt-2 text-sm font-light leading-relaxed text-muted-foreground">
            {insight.summary}
          </p>

          <div className="mt-4 flex flex-col">
            {onCameras && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={onCameras}
                className={`${linkCls} text-foreground/90`}
              >
                {x.cameras}
              </Button>
            )}
            {onWeather && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={onWeather}
                className={`${linkCls} text-foreground/90`}
              >
                {x.weather}
              </Button>
            )}
            {onHistory && (inHistory || historyHour !== null) && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => onHistory(inHistory ? 0 : (historyHour ?? 0))}
                className={`${linkCls} text-foreground/90`}
              >
                {inHistory ? x.now : x.before}
              </Button>
            )}
          </div>

          {nearby.length > 0 && onSelect && (
            <>
              <p className="label-track mt-5 text-[11px] text-muted-foreground">{x.around}</p>
              <ul className="mt-1 flex flex-col">
                {nearby.map(({ event: n, distanceKm }) => (
                  <li key={n.id}>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => onSelect(n)}
                      className="focus-ring flex min-h-11 h-auto w-full items-center justify-between gap-3 px-0 text-left hover:bg-transparent hover:opacity-70"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ backgroundColor: CATEGORY_META[n.category]?.color }}
                          aria-hidden
                        />
                        <span className="truncate text-xs font-light text-foreground/90">
                          {n.place}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                        {format(x.km, { km: distanceKm })}
                      </span>
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="label-track mt-5 text-[11px] text-muted-foreground">
            {t.insight.whatWeKnow}
          </p>
          <div className="mt-3 flex flex-col gap-2.5">
            {insight.facts.map((fact) => (
              <Row key={fact.label} label={fact.label} value={fact.value} />
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <span className="label-track text-[11px] text-muted-foreground">
              {t.insight.source}
            </span>
            {insight.sources.map((s) => (
              <span
                key={s}
                className="label-track rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setDeep(false)}
              className={`${linkCls} text-muted-foreground`}
            >
              <ArrowLeft className="h-3 w-3" strokeWidth={1.4} />
              {t.discovery.back}
            </Button>
            {onFollow && !following && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => onFollow(event)}
                className={`${linkCls} text-muted-foreground`}
              >
                {x.wantFollow}
              </Button>
            )}
          </div>
          {next && onSelect && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => onSelect(next.event)}
              className={`${linkCls} text-primary`}
            >
              {next.reason === "nearby" ? x.nextNearby : x.nextElsewhere}
              <ArrowRight
                className="h-3 w-3 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
                strokeWidth={1.4}
              />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="label-track text-[11px] text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words text-right font-mono text-xs text-foreground/90">
        {value}
      </span>
    </div>
  );
}
