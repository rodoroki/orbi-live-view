import { createFileRoute } from "@tanstack/react-router";
import { SectionPage, DemoList } from "@/components/orbi/SectionPage";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "ORBI LIVE — Sobre o ORBI" },
      { name: "description", content: 'ORBI LIVE é uma plataforma de inteligência planetária. Reunirá NASA EONET, Windy, NOAA, USGS, webcams e outras fontes em uma única janela de observação.' },
      { property: "og:title", content: "ORBI LIVE — Sobre o ORBI" },
      { property: "og:description", content: 'ORBI LIVE é uma plataforma de inteligência planetária. Reunirá NASA EONET, Windy, NOAA, USGS, webcams e outras fontes em uma única janela de observação.' },
    ],
  }),
  component: Page,
});

const items: [string, string][] = [["Versão", "0.1 · protótipo"], ["Estado", "identidade visual"], ["Fontes previstas", "6+"]];

function Page() {
  return (
    <SectionPage eyebrow="Sobre" title="Sobre o ORBI" intro={'ORBI LIVE é uma plataforma de inteligência planetária. Reunirá NASA EONET, Windy, NOAA, USGS, webcams e outras fontes em uma única janela de observação.'}>
      <DemoList items={items} />
    </SectionPage>
  );
}
