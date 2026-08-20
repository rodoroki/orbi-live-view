import globe from "@/assets/globe.jpg";

const markers = [
  { top: "38%", left: "31%", label: "Wildfire" },
  { top: "58%", left: "46%", label: "Storm" },
  { top: "46%", left: "66%", label: "Seismic" },
];

export function PlanetStage() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      style={{ background: "var(--gradient-void)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div className="relative aspect-square w-[min(78vh,780px)]">
        <img
          src={globe}
          alt="Representação do planeta Terra observada do espaço"
          width={1280}
          height={1280}
          className="h-full w-full rounded-full object-cover"
          style={{ boxShadow: "var(--glow-orbit)" }}
        />
        <div
          className="pointer-events-none absolute -inset-[12%] rounded-full border border-primary/15"
          style={{ animation: "orbi-spin 90s linear infinite" }}
        >
          <span className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
        </div>

        {markers.map((m) => (
          <span
            key={m.label}
            className="absolute flex items-center gap-2"
            style={{ top: m.top, left: m.left }}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-soft shadow-[0_0_12px_var(--emerald-soft)]" />
            <span className="label-track text-[9px] text-muted-foreground">{m.label}</span>
          </span>
        ))}
      </div>

      <div className="absolute bottom-7 left-6 flex gap-8">
        <Meta label="Lat" value="-23.55" />
        <Meta label="Lon" value="-46.63" />
        <Meta label="Zoom" value="2.4×" />
      </div>
      <p className="label-track absolute bottom-7 right-6 text-[9px] text-muted-foreground/70">
        dados simulados
      </p>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label-track text-[9px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-sm">{value}</p>
    </div>
  );
}