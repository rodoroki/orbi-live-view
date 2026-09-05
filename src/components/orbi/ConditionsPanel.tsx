import { useState } from "react";
import { X, Map as MapIcon } from "lucide-react";
import { ATMOSPHERE_METRICS, OCEAN_METRICS, type Metric } from "@/lib/conditions";
import { useWindyForecast } from "@/lib/windy";
import { useTranslation } from "@/lib/i18n";

function Sparkline({ points }: { points: number[] }) {
  const d = points
    .map((p, i) => `${(i / (points.length - 1)) * 100},${(1 - p) * 20}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="h-5 w-16 opacity-70">
      <polyline
        points={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function MetricRow({ metric, label }: { metric: Metric; label: string }) {
  return (
    <div className="group flex items-center gap-3 rounded-sm px-1.5 py-1.5 transition-colors duration-200 hover:bg-accent">
      <span className="label-track flex-1 text-[9px] text-muted-foreground">{label}</span>
      <span className="text-primary/70">
        <Sparkline points={metric.series} />
      </span>
      <span className="w-24 text-right font-mono text-xs text-foreground">{metric.value}</span>
    </div>
  );
}

export default function ConditionsPanel({
  onClose,
  onOpenWeatherMap,
  coords,
}: {
  onClose: () => void;
  onOpenWeatherMap: () => void;
  coords: { lat: number; lng: number } | null;
}) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"atmosphere" | "ocean">("atmosphere");
  const { data: liveMetrics, isSuccess } = useWindyForecast(
    coords?.lat ?? null,
    coords?.lng ?? null,
  );
  const isLive = tab === "atmosphere" && isSuccess && !!liveMetrics;
  // mantém as 8 linhas atmosféricas, substituindo pelas medidas ao vivo quando existem
  const metrics =
    tab === "ocean"
      ? OCEAN_METRICS
      : ATMOSPHERE_METRICS.map(
          (m) => liveMetrics?.find((live) => live.key === m.key) ?? m,
        );

  return (
    <div className="surface-panel absolute inset-x-3 bottom-20 z-10 rounded-md p-4 animate-sheet-up md:inset-x-auto md:bottom-auto md:right-6 md:top-24 md:w-80 md:p-5 md:animate-rise">
      <div className="flex items-start justify-between">
        <p className="label-track text-primary">{t.conditions.title}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
          className="focus-ring text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" strokeWidth={1.4} />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-1">
        {(["atmosphere", "ocean"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`label-track focus-ring rounded-full px-3 py-1.5 text-[9px] transition-colors duration-200 ${
              tab === key
                ? "bg-accent text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.conditions[key]}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-col">
        {metrics.map((m) => (
          <MetricRow
            key={m.key}
            metric={m}
            label={t.metrics[m.key as keyof typeof t.metrics]}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onOpenWeatherMap}
        className="focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-border py-2 text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground active:scale-[0.99]"
      >
        <MapIcon className="h-3.5 w-3.5" strokeWidth={1.4} />
        <span className="label-track text-[9px]">{t.conditions.viewWeatherMap}</span>
      </button>

      <p className="label-track mt-4 border-t border-border pt-3 text-[9px] text-muted-foreground/70">
        {isLive ? `${t.common.live} · WINDY GFS` : t.common.simulatedData}
      </p>
    </div>
  );
}
