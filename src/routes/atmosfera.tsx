import { createFileRoute } from "@tanstack/react-router";
import { SectionPage, DemoList } from "@/components/orbi/SectionPage";

export const Route = createFileRoute("/atmosfera")({
  head: () => ({
    meta: [
      { title: "ORBI LIVE — Camada atmosférica" },
      { name: "description", content: 'Vento, temperatura, umidade e pressão apresentados como camadas sobre o mapa planetário.' },
      { property: "og:title", content: "ORBI LIVE — Camada atmosférica" },
      { property: "og:description", content: 'Vento, temperatura, umidade e pressão apresentados como camadas sobre o mapa planetário.' },
    ],
  }),
  component: Page,
});

const items: [string, string][] = [["Vento 10 m", "18 kt"], ["Temperatura", "14,2 °C"], ["Umidade relativa", "62 %"], ["Pressão", "1013 hPa"]];

function Page() {
  return (
    <SectionPage eyebrow="Atmosfera" title="Camada atmosférica" intro={'Vento, temperatura, umidade e pressão apresentados como camadas sobre o mapa planetário.'}>
      <DemoList items={items} />
    </SectionPage>
  );
}
