import { useEffect, useState } from "react";
import { Play, Pause } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const MIN = -48;
const MAX = 48;

/**
 * ORBI — exploração temporal.
 * Uma linha, um ponto, uma palavra. O tempo é uma dimensão do planeta:
 * o estado (LIVE · HISTÓRICO · PREVISÃO) acompanha a posição do ponto.
 */
export default function TimelineBar({
  hour,
  onChange,
}: {
  hour: number;
  onChange: (hour: number) => void;
}) {
  const { t, locale } = useTranslation();
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      onChange(hour >= MAX ? MIN : hour + 1);
    }, 90);
    return () => window.clearInterval(id);
  }, [playing, hour, onChange]);

  const relative = (() => {
    if (hour === 0) return t.timeline.now.toUpperCase();
    const abs = Math.abs(hour);
    if (hour < 0)
      return locale === "en" ? `${abs}h ago` : locale === "es" ? `hace ${abs}h` : `há ${abs}h`;
    return locale === "en" ? `in ${abs}h` : locale === "es" ? `en ${abs}h` : `em ${abs}h`;
  })();

  const mode =
    hour === 0 ? t.timeline.live : hour < 0 ? t.timeline.historical : t.timeline.forecast;

  const pos = ((hour - MIN) / (MAX - MIN)) * 100;

  return (
    <div className="absolute bottom-20 left-1/2 z-10 flex w-[min(92vw,440px)] -translate-x-1/2 flex-col items-center animate-rise md:w-[min(440px,40vw)]">
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label={playing ? t.timeline.pause : t.timeline.play}
          onClick={() => setPlaying((v) => !v)}
          className="focus-ring flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground/70 transition-colors duration-300 hover:text-primary"
        >
          {playing ? (
            <Pause className="h-3 w-3" strokeWidth={1.4} />
          ) : (
            <Play className="h-3 w-3" strokeWidth={1.4} />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setPlaying(false);
            onChange(0);
          }}
          className={`label-track focus-ring flex items-center gap-2 rounded-sm px-1 text-[10px] transition-colors duration-300 ${
            hour === 0 ? "text-primary" : "text-foreground/80 hover:text-primary"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              hour === 0 ? "bg-primary" : "bg-muted-foreground/60"
            }`}
            style={hour === 0 ? { animation: "orbi-pulse 2.6s ease-in-out infinite" } : undefined}
          />
          {mode.toUpperCase()}
          <span className="text-muted-foreground/50">·</span>
          <span className="text-muted-foreground/70">{relative}</span>
        </button>
      </div>

      <div className="relative mt-3 w-full">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        <span
          className="pointer-events-none absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary transition-[left] duration-200"
          style={{ left: `${pos}%` }}
        />
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={1}
          value={hour}
          aria-label={t.timeline.title}
          onChange={(e) => {
            setPlaying(false);
            onChange(Number(e.target.value));
          }}
          className="orbi-range absolute inset-x-0 -top-2.5 h-5 w-full cursor-pointer appearance-none bg-transparent opacity-0"
        />
      </div>
    </div>
  );
}
