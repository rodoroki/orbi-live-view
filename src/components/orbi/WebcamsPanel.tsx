import { X, Camera } from "lucide-react";
import { useWindyWebcams } from "@/lib/windy";
import { useTranslation } from "@/lib/i18n";

/**
 * Câmeras ao vivo próximas do ponto observado (Windy Webcams API v3).
 */
export default function WebcamsPanel({
  coords,
  onClose,
}: {
  coords: { lat: number; lng: number } | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useWindyWebcams(
    coords?.lat ?? null,
    coords?.lng ?? null,
  );

  return (
    <div className="surface-panel absolute inset-x-3 bottom-20 z-20 max-h-[60vh] overflow-y-auto rounded-md p-4 animate-sheet-up md:inset-x-auto md:bottom-auto md:left-24 md:top-24 md:w-80 md:p-5 md:animate-rise">
      <div className="flex items-start justify-between">
        <p className="label-track text-primary">{t.webcams.title}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
          className="focus-ring text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" strokeWidth={1.4} />
        </button>
      </div>

      {isLoading && (
        <p className="label-track mt-4 text-[9px] text-muted-foreground">{t.webcams.loading}</p>
      )}
      {(isError || (data && data.length === 0)) && !isLoading && (
        <p className="label-track mt-4 text-[9px] text-muted-foreground">{t.webcams.empty}</p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {(data ?? []).map((cam) => (
          <a
            key={cam.id}
            href={`https://windy.com/webcams/${cam.id}`}
            target="_blank"
            rel="noreferrer"
            className="focus-ring group overflow-hidden rounded-sm border border-border transition-colors hover:border-primary/40"
          >
            {cam.imageUrl ? (
              <img
                src={cam.imageUrl}
                alt={cam.title}
                loading="lazy"
                className="h-32 w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
              />
            ) : (
              <div className="flex h-32 w-full items-center justify-center text-muted-foreground">
                <Camera className="h-4 w-4" strokeWidth={1.4} />
              </div>
            )}
            <div className="flex items-baseline justify-between gap-2 px-2.5 py-2">
              <span className="truncate text-xs text-foreground">{cam.title}</span>
              <span className="label-track shrink-0 text-[9px] text-muted-foreground">
                {cam.lat.toFixed(1)}, {cam.lng.toFixed(1)}
              </span>
            </div>
          </a>
        ))}
      </div>

      <p className="label-track mt-4 border-t border-border pt-3 text-[9px] text-muted-foreground/70">
        {t.common.live} · WINDY WEBCAMS
      </p>
    </div>
  );
}
