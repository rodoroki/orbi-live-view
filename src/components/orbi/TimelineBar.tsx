import { useEffect, useState } from "react";
import { Play, Pause } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const MIN = -48;
const MAX = 48;

/**
 * ORBI — exploração temporal.
 * Uma linha, um ponto, uma palavra. Sem números permanentes.
 */
export default function TimelineBar() {
  const { t, locale } = useTranslation();
  const [hour, setHour] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setHour((h) => (h >= MAX ? MIN : h + 1));
    }, 90);
    return () => window.clearInterval(id);
  }, [playing]);

  const relative = (() => {
    if (hour === 0) return t.timeline.now.toUpperCase();
    const abs = Math.abs(hour);
    const unit = abs === 1 ? "h" : "h";
    if (hour < 0)
      return locale === "en"
        ? `${abs}${unit} ago`
        : locale === "es"
          ? `hace ${abs}${unit}`
          : `há ${abs}${unit}`;
    return locale === "en"
      ? `in ${abs}${unit}`
      : locale === "es"
        ? `en ${abs}${unit}`
        : `em ${abs}${unit}`;
  })();

  const pos = ((hour - MIN) / (MAX - MIN)) * 100;

  return (
    <div className="absolute bottom-20 left-1/2 z-10 hidden w-[min(440px,40vw)] -translate-x-1/2 flex-col items-center animate-rise md:flex">
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
            setHour(0);
          }}
          className={`label-track focus-ring rounded-sm px-1 text-[10px] transition-colors duration-300 ${
            hour === 0 ? "text-primary" : "text-foreground/80 hover:text-primary"
          }`}
        >
          {relative}
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
          onChange={(e) => setHour(Number(e.target.value))}
          className="orbi-range absolute inset-x-0 -top-2.5 h-5 w-full cursor-pointer appearance-none bg-transparent opacity-0"
        />
      </div>
    </div>
  );
}
