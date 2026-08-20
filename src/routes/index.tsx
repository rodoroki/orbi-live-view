import { createFileRoute } from "@tanstack/react-router";
import { PlanetStage } from "@/components/orbi/PlanetStage";
import { ContextPanel, PanelRow } from "@/components/orbi/ContextPanel";

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
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="min-w-0 flex-1">
        <PlanetStage />
      </div>
      <ContextPanel eyebrow="Contexto" title="Observação global">
        <div className="flex flex-col gap-3">
          <PanelRow label="Camada" value="Base" />
          <PanelRow label="Eventos ativos" value="128" />
          <PanelRow label="Fontes" value="6" />
          <PanelRow label="Atualizado" value="00:12 UTC" />
        </div>
        <div className="flex flex-col gap-4">
          <p className="label-track text-muted-foreground">Sinais recentes</p>
          {[
            ["Incêndio · Amazônia", "há 12 min"],
            ["Ciclone · Pacífico Sul", "há 34 min"],
            ["Sismo M4.8 · Chile", "há 1 h"],
          ].map(([t, s]) => (
            <div key={t} className="border-l border-primary/40 pl-3">
              <p className="text-sm text-foreground">{t}</p>
              <p className="label-track mt-1 text-[9px] text-muted-foreground">{s}</p>
            </div>
          ))}
        </div>
      </ContextPanel>
    </div>
  );
}
