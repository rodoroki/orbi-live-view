import { createFileRoute } from "@tanstack/react-router";
import { SectionPage, DemoList } from "@/components/orbi/SectionPage";

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      { title: "ORBI LIVE — Eventos planetários" },
      { name: "description", content: 'Registro contínuo de fenômenos naturais observados na superfície e na atmosfera. Fontes reais serão conectadas em etapa posterior.' },
      { property: "og:title", content: "ORBI LIVE — Eventos planetários" },
      { property: "og:description", content: 'Registro contínuo de fenômenos naturais observados na superfície e na atmosfera. Fontes reais serão conectadas em etapa posterior.' },
    ],
  }),
  component: Page,
});

const items: [string, string][] = [["Incêndio · Amazônia", "ativo · 12 min"], ["Ciclone · Pacífico Sul", "ativo · 34 min"], ["Sismo M4.8 · Chile", "1 h"], ["Erupção · Islândia", "3 h"]];

function Page() {
  return (
    <SectionPage eyebrow="Eventos" title="Eventos planetários" intro={'Registro contínuo de fenômenos naturais observados na superfície e na atmosfera. Fontes reais serão conectadas em etapa posterior.'}>
      <DemoList items={items} />
    </SectionPage>
  );
}
