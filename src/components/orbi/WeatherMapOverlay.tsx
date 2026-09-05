import { useState } from "react";
import { X } from "lucide-react";
import { WEATHER_LAYERS, type MetricKey } from "@/lib/conditions";
import { useTranslation } from "@/lib/i18n";

/** Camadas do painel → overlays do mapa Windy */
const WINDY_OVERLAY: Record<string, string> = {
  wind: "wind",
  temperature: "temp",
  precipitation: "rain",
  pressure: "pressure",
  waves: "waves",
  swell: "swell1",
  cloud: "clouds",
  humidity: "rh",
};

/**
 * Mapa meteorológico ao vivo — Windy embed (camadas globais animadas).
 */
export default function WeatherMapOverlay({
  onClose,
  coords,
}: {
  onClose: () => void;
  coords: { lat: number; lng: number } | null;
}) {
  const { t, locale } = useTranslation();
  const [layer, setLayer] = useState<MetricKey>(WEATHER_LAYERS[0]!);

  const lat = coords?.lat ?? -15.8;
  const lng = coords?.lng ?? -47.9;
  const overlay = WINDY_OVERLAY[layer] ?? "wind";
  const lang = locale === "pt-BR" ? "pt" : locale;
  const src =
    `https://embed.windy.com/embed2.html?lat=${lat.toFixed(3)}&lon=${lng.toFixed(3)}` +
    `&detailLat=${lat.toFixed(3)}&detailLon=${lng.toFixed(3)}&width=100%25&height=100%25` +
    `&zoom=5&level=surface&overlay=${overlay}&product=ecmwf&menu=&message=true&marker=true` +
    `&calendar=now&pressure=&type=map&location=coordinates&detail=true` +
    `&metricWind=default&metricTemp=default&radarRange=-1&lang=${lang}`;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 md:p-8">
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="surface-panel relative flex h-full w-full max-w-5xl flex-col rounded-lg p-4 animate-rise md:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="label-track text-primary">{t.conditions.weatherMap}</p>
            <h2 className="mt-2 text-base font-medium tracking-tight">
              {t.conditions.weatherMapTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="focus-ring text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" strokeWidth={1.4} />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-1">
          {WEATHER_LAYERS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setLayer(key)}
              className={`label-track focus-ring rounded-full px-3 py-1.5 text-[9px] transition-colors duration-200 ${
                layer === key
                  ? "bg-accent text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.metrics[key as keyof typeof t.metrics]}
            </button>
          ))}
        </div>

        <div className="relative mt-4 flex-1 overflow-hidden rounded-md border border-border">
          <iframe
            key={`${overlay}-${lat.toFixed(2)}-${lng.toFixed(2)}`}
            title={t.conditions.weatherMapTitle}
            src={src}
            className="h-full w-full"
            loading="lazy"
            frameBorder={0}
          />
        </div>

        <p className="label-track mt-3 text-[9px] text-muted-foreground/70">
          {t.common.live} · WINDY
        </p>
      </div>
    </div>
  );
}
