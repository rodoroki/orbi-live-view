import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PanelRight } from "lucide-react";
import { PlanetStage } from "@/components/orbi/PlanetStage";
import {
  ToolRail,
  ZoomControls,
  LayerBar,
  ContextCard,
} from "@/components/orbi/MapControls";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ORBI LIVE — Mapa planetário" },
      {
        name: "description",
        content:
          "Observe o planeta em uma interface minimalista de inteligência planetária, com eventos, atmosfera e oceanos em um único mapa.",
      },
      { property: "og:title", content: "ORBI LIVE — Mapa planetário" },
      {
        property: "og:description",
        content: "Uma janela sofisticada para observar a Terra.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [panelOpen, setPanelOpen] = useState(true);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <PlanetStage />
      <ToolRail />
      <ZoomControls />
      <LayerBar />
      <ContextCard open={panelOpen} onClose={() => setPanelOpen(false)} />
      {!panelOpen && (
        <button
          type="button"
          onClick={() => setPanelOpen(true)}
          aria-label="Abrir painel de contexto"
          className="surface-panel absolute right-6 top-24 z-10 flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
        >
          <PanelRight className="h-4 w-4" strokeWidth={1.4} />
        </button>
      )}
    </div>
  );
}
