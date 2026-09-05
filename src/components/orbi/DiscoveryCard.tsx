import { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft, X } from "lucide-react";
import { CATEGORY_META, type OrbiEvent } from "@/lib/orbi-events";
import { format, useTranslation } from "@/lib/i18n";

/**
 * ORBI — Discovery
 *
 * Um acontecimento não é um "card de dados": é um sinal.
 * Passo 1 — o sinal (lugar, fenômeno, quando).
 * Passo 2 — o contexto ("o que está acontecendo aqui?").
 */
export default function DiscoveryCard({
  event,
  onClose,
}: {
  event: OrbiEvent;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [deep, setDeep] = useState(false);

  useEffect(() => {
    setDeep(false);
  }, [event.id]);

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
        <div className="animate-fade-in">
          <span className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: color, animation: "orbi-pulse 2.6s ease-in-out infinite" }}
            />
            <span className="label-track text-[9px] text-muted-foreground/70">
              {t.discovery.signal}
            </span>
          </span>

          <h2 className="label-track mt-4 text-[11px] text-foreground">
            {event.place.toUpperCase()}
          </h2>
          <p className="mt-2 text-sm font-light leading-snug text-muted-foreground">
            {phenomenon}
          </p>
          <p className="label-track mt-4 text-[9px] text-muted-foreground/60">
            {format(t.discovery.detected, { time: elapsed })}
          </p>

          <button
            type="button"
            onClick={() => setDeep(true)}
            className="focus-ring label-track group mt-6 flex items-center gap-2 text-[10px] text-primary transition-opacity duration-300 hover:opacity-70"
          >
            {t.discovery.discover}
            <ArrowRight
              className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5"
              strokeWidth={1.4}
            />
          </button>
        </div>
      ) : (
        <div className="animate-fade-in">
          <p className="label-track text-[9px] text-primary">
            {t.discovery.whatIsHappening}
          </p>

          <p className="mt-4 text-sm font-light leading-relaxed text-foreground">
            {format(t.discovery.context, { phenomenon, place: event.place })}
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <Row label={t.discovery.began} value={format(t.discovery.detected, { time: elapsed })} />
            <Row label={t.discovery.intensity} value={event.magnitude} />
            <Row
              label={t.discovery.coordinates}
              value={`${event.lat.toFixed(1)}, ${event.lng.toFixed(1)}`}
            />
          </div>

          <div className="mt-6 flex items-center gap-2 border-t border-border pt-4">
            {["NASA", "Windy"].map((s) => (
              <span
                key={s}
                className="label-track rounded-full border border-border/60 px-2.5 py-1 text-[9px] text-muted-foreground/70"
              >
                {s}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setDeep(false)}
            className="focus-ring label-track mt-5 flex items-center gap-2 text-[10px] text-muted-foreground transition-colors duration-300 hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={1.4} />
            {t.discovery.back}
          </button>
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
