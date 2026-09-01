import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const MIN = -48;
const MAX = 48;

export default function TimelineBar() {
  const { t } = useTranslation();
  const [hour, setHour] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setHour((h) => (h >= MAX ? MIN : h + 1));
    }, 90);
    return () => window.clearInterval(id);
  }, [playing]);

  const label =
    hour === 0
      ? t.timeline.now
      : `${hour > 0 ? "+" : "−"}${Math.abs(hour)} h`;

  return (
    <div className="surface-panel absolute bottom-20 left-1/2 z-10 hidden w-[min(520px,46vw)] -translate-x-1/2 items-center gap-4 rounded-full px-4 py-2.5 animate-rise md:flex">
      <button
        type="button"
        aria-label={playing ? t.timeline.pause : t.timeline.play}
        onClick={() => setPlaying((v) => !v)}
        className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-primary transition-colors duration-200 hover:bg-accent active:scale-95"
      >
        {playing ? (
          <Pause className="h-3.5 w-3.5" strokeWidth={1.6} />
        ) : (
          <Play className="h-3.5 w-3.5" strokeWidth={1.6} />
        )}
      </button>

      <div className="flex-1">
        <div className="label-track flex items-center justify-between text-[9px] text-muted-foreground/70">
          <span>−48h</span>
          <span className={hour === 0 ? "text-primary" : "text-foreground"}>{label}</span>
          <span>+48h</span>
        </div>

        <div className="relative mt-1.5">
          <div className="h-px w-full bg-border" />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between">
            {Array.from({ length: 17 }).map((_, i) => (
              <span
                key={i}
                className={`block w-px ${i === 8 ? "h-2 bg-primary/60" : "h-1 bg-border"}`}
              />
            ))}
          </div>
          <input
            type="range"
            min={MIN}
            max={MAX}
            step={1}
            value={hour}
            aria-label={t.timeline.title}
            onChange={(e) => setHour(Number(e.target.value))}
            className="orbi-range absolute inset-x-0 -top-2 h-4 w-full cursor-pointer appearance-none bg-transparent"
          />
        </div>
      </div>

      <button
        type="button"
        aria-label={t.timeline.reset}
        onClick={() => {
          setPlaying(false);
          setHour(0);
        }}
        className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground active:scale-95"
      >
        <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.4} />
      </button>
    </div>
  );
}
