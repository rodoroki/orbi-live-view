import { useState } from "react";
import { Globe2, Activity, Clock, Info, Plus, Minus, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

const tools = [
  { label: "Mapa", to: "/", icon: Globe2 },
  { label: "Eventos", to: "/eventos", icon: Activity },
  { label: "Timeline", to: "/timeline", icon: Clock },
  { label: "Sobre o ORBI", to: "/sobre", icon: Info },
] as const;

export function ToolRail() {
  return (
    <div className="surface-panel absolute left-6 top-1/2 z-10 flex -translate-y-1/2 flex-col rounded-full p-1.5">
      {tools.map((t) => (
        <Link
          key={t.label}
          to={t.to}
          title={t.label}
          aria-label={t.label}
          activeOptions={{ exact: t.to === "/" }}
          className="group flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[status=active]:text-primary"
        >
          <t.icon className="h-4 w-4" strokeWidth={1.4} />
        </Link>
      ))}
    </div>
  );
}

export function ZoomControls() {
  return (
    <div className="surface-panel absolute bottom-24 right-6 z-10 flex flex-col rounded-full p-1.5">
      {[Plus, Minus].map((Icon, i) => (
        <button
          key={i}
          type="button"
          aria-label={i === 0 ? "Aproximar" : "Afastar"}
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Icon className="h-4 w-4" strokeWidth={1.4} />
        </button>
      ))}
    </div>
  );
}

const layers = ["Base", "Eventos", "Atmosfera", "Oceano"];

export function LayerBar() {
  const [active, setActive] = useState("Base");
  return (
    <div className="surface-panel absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full p-1.5">
      {layers.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setActive(l)}
          className={`label-track rounded-full px-4 py-2 transition-colors ${
            active === l
              ? "bg-accent text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function ContextCard({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="surface-panel absolute right-6 top-24 z-10 w-72 animate-fade-in rounded-md p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="label-track text-primary">Contexto</p>
          <h2 className="mt-2 text-base font-medium tracking-tight">Observação global</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar painel"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-4 w-4" strokeWidth={1.4} />
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        {[
          ["Eventos ativos", "128"],
          ["Fontes", "6"],
          ["Atualizado", "00:12 UTC"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between">
            <span className="label-track text-muted-foreground">{k}</span>
            <span className="font-mono text-sm">{v}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border pt-4">
        {[
          ["Incêndio · Amazônia", "há 12 min"],
          ["Ciclone · Pacífico Sul", "há 34 min"],
          ["Sismo M4.8 · Chile", "há 1 h"],
        ].map(([t, s]) => (
          <div key={t} className="border-l border-primary/40 pl-3">
            <p className="text-sm">{t}</p>
            <p className="label-track mt-1 text-[9px] text-muted-foreground">{s}</p>
          </div>
        ))}
      </div>
    </div>
  );
}