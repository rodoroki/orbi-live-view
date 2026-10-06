import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, useTranslation } from "@/lib/i18n";
import type { OrbitalElements } from "@/lib/space.functions";
import { epochAgeHours, type SatPosition } from "@/lib/satellites";
import type { OrbiEvent } from "@/lib/orbi-events";
import { getNearbyDiscoveries } from "@/lib/exploration/discovery";

/** Satélite real: o que é, onde está agora, de onde vem o dado, e para onde continuar. */
export default function SatelliteCard({
  sat,
  pos,
  following,
  events,
  onFollow,
  onRegion,
  onSelectEvent,
  onNext,
  onClose,
}: {
  sat: OrbitalElements;
  pos: SatPosition | null;
  following: boolean;
  events: OrbiEvent[];
  onFollow: () => void;
  onRegion: () => void;
  onSelectEvent: (e: OrbiEvent) => void;
  onNext?: (() => void) | undefined;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const x = t.exploration;
  const nearby = pos ? getNearbyDiscoveries(pos, events, { radiusKm: 2000, limit: 2 }) : [];
  const link =
    "focus-ring label-track flex min-h-11 h-auto items-center gap-2 px-0 text-xs hover:bg-transparent hover:opacity-70";

  return (
    <div
      role="dialog"
      aria-label={sat.OBJECT_NAME}
      className="orbi-sheet surface-panel absolute inset-x-3 bottom-20 z-20 rounded-md p-5 animate-sheet-up md:inset-x-auto md:bottom-auto md:right-6 md:top-24 md:w-[19rem] md:p-6 md:animate-rise"
    >
      <Button
        variant="ghost"
        size="sm"
        type="button"
        onClick={onClose}
        aria-label={t.common.close}
        className="focus-ring absolute right-1 top-1 h-11 w-11 p-1.5 text-muted-foreground hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" strokeWidth={1.4} />
      </Button>
      <p className="label-track text-[11px] text-primary">{x.catSatellites2}</p>
      <h2 className="mt-3 pr-8 text-base font-light text-foreground">{sat.OBJECT_NAME}</h2>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
        NORAD {sat.NORAD_CAT_ID} · {sat.OBJECT_ID}
      </p>

      {pos ? (
        <dl className="mt-4 grid grid-cols-2 gap-y-2 text-xs" aria-live="polite">
          <dt className="label-track text-[11px] text-muted-foreground">{x.satAltitude}</dt>
          <dd className="text-right font-mono">{Math.round(pos.altitudeKm)} km</dd>
          <dt className="label-track text-[11px] text-muted-foreground">{x.satSpeed}</dt>
          <dd className="text-right font-mono">{pos.velocityKms.toFixed(2)} km/s</dd>
          <dt className="label-track text-[11px] text-muted-foreground">Lat / Lng</dt>
          <dd className="text-right font-mono">
            {pos.lat.toFixed(1)}°, {pos.lng.toFixed(1)}°
          </dd>
          <dt className="label-track text-[11px] text-muted-foreground">{x.satUpdated}</dt>
          <dd className="text-right font-mono">{pos.at.toISOString().slice(11, 19)} UTC</dd>
          <dt className="label-track text-[11px] text-muted-foreground">{x.satElements}</dt>
          <dd className="text-right font-mono">
            {format(x.hoursAgo, { h: epochAgeHours(sat, pos.at) })}
          </dd>
        </dl>
      ) : (
        <p className="mt-4 text-xs text-muted-foreground">{x.satError}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-x-5">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          aria-pressed={following}
          onClick={onFollow}
          className={`${link} ${following ? "text-discovery" : "text-primary"}`}
        >
          {following ? x.following : x.satFollow}
        </Button>
        {pos && (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={onRegion}
            className={`${link} text-muted-foreground`}
          >
            {x.satRegion}
          </Button>
        )}
      </div>

      {nearby.length > 0 && (
        <>
          <p className="label-track mt-3 text-[11px] text-muted-foreground">{x.around}</p>
          {nearby.map(({ event, distanceKm }) => (
            <Button
              key={event.id}
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => onSelectEvent(event)}
              className="focus-ring flex min-h-11 h-auto w-full justify-between px-0 text-xs font-light hover:bg-transparent hover:opacity-70"
            >
              <span className="truncate">{event.place}</span>
              <span className="font-mono text-muted-foreground">
                {format(x.km, { km: distanceKm })}
              </span>
            </Button>
          ))}
        </>
      )}

      {onNext && (
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={onNext}
          className={`${link} text-primary`}
        >
          {x.satNext}
          <ArrowRight className="h-3 w-3" strokeWidth={1.4} />
        </Button>
      )}

      <p className="mt-3 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
        {x.satComputed} {x.satSource}
      </p>
    </div>
  );
}
