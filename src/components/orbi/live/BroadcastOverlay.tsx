import { useEffect, useState } from "react";

import { OrbiMark } from "@/components/orbi/OrbiMark";
import { useTranslation } from "@/lib/i18n";
import { sceneLocalTime, type LiveScene } from "@/lib/live/scene";
import { useWindyForecast } from "@/lib/windy";

/** Contexto meteorológico só aparece se a integração existente já o devolver. */
function useSceneWeather(scene: LiveScene | null) {
  const { data } = useWindyForecast(scene?.lat ?? null, scene?.lng ?? null);
  if (!data) return [] as string[];
  return data
    .filter((m) => m.key === "temperature" || m.key === "wind")
    .map((m) => m.value)
    .filter(Boolean);
}

export default function BroadcastOverlay({ scene }: { scene: LiveScene | null }) {
  const { t, locale } = useTranslation();
  const weather = useSceneWeather(scene);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const localTime = scene ? sceneLocalTime(scene, now, locale) : null;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 md:p-10">
      <header className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-3 text-foreground/90">
          <OrbiMark className="h-6 w-6" />
          <span className="label-track text-[10px]">ORBI LIVE</span>
        </div>
        <div className="flex items-center gap-2 text-foreground/90">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          <span className="label-track text-[10px]">{t.broadcast.live}</span>
        </div>
      </header>

      <footer className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
          <div className="min-w-0">
            <p className="truncate text-2xl font-medium tracking-tight text-foreground md:text-3xl">
              {scene?.place ?? "—"}
            </p>
            {scene?.area && (
              <p className="mt-1 truncate text-sm text-foreground/60">{scene.area}</p>
            )}
          </div>

          <div className="flex flex-col items-start gap-1 md:items-end">
            {localTime && (
              <p className="font-mono text-sm text-foreground/80">
                {localTime}{" "}
                <span className="label-track text-[9px] text-foreground/45">
                  {t.broadcast.localTime}
                </span>
              </p>
            )}
            {weather.length > 0 && (
              <p className="font-mono text-xs text-foreground/60">{weather.join(" · ")}</p>
            )}
          </div>
        </div>

        <p className="label-track text-[9px] text-foreground/40">
          {scene ? (
            <a
              href={scene.sourceUrl}
              target="_blank"
              rel="noreferrer"
              title={t.broadcast.openCamera}
              className="pointer-events-auto focus-ring transition-colors hover:text-foreground/70"
            >
              {t.broadcast.attribution}
            </a>
          ) : (
            t.broadcast.attribution
          )}
        </p>
      </footer>
    </div>
  );
}
