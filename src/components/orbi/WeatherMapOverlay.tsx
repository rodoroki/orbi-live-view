import { useState } from "react";
import { X } from "lucide-react";
import { WEATHER_LAYERS } from "@/lib/conditions";
import { useTranslation } from "@/lib/i18n";

/**
 * Superfície reservada ao futuro provedor de mapas meteorológicos (Windy).
 * Nenhuma integração externa nesta etapa — apenas a experiência visual.
 */
export default function WeatherMapOverlay({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [layer, setLayer] = useState(WEATHER_LAYERS[0]);

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
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: "url(/textures/earth-night.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="label-track max-w-sm text-center text-[9px] leading-loose text-muted-foreground">
              {t.conditions.weatherMapBody}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
