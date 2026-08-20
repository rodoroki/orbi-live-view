import { createFileRoute } from "@tanstack/react-router";
import { SectionPage, DemoList } from "@/components/orbi/SectionPage";

export const Route = createFileRoute("/explorar")({
  head: () => ({
    meta: [
      { title: "ORBI LIVE — Explorar o planeta" },
      { name: "description", content: 'Navegue por regiões, marcadores e pontos de observação. Uma superfície aberta para descoberta.' },
      { property: "og:title", content: "ORBI LIVE — Explorar o planeta" },
      { property: "og:description", content: 'Navegue por regiões, marcadores e pontos de observação. Uma superfície aberta para descoberta.' },
    ],
  }),
  component: Page,
});

const items: [string, string][] = [["Regiões", "7"], ["Pontos de observação", "240"], ["Webcams", "fonte futura"], ["Camadas", "fonte futura"]];

function Page() {
  return (
    <SectionPage eyebrow="Explorar" title="Explorar o planeta" intro={'Navegue por regiões, marcadores e pontos de observação. Uma superfície aberta para descoberta.'}>
      <DemoList items={items} />
    </SectionPage>
  );
}
