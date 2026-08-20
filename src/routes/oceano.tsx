import { createFileRoute } from "@tanstack/react-router";
import { SectionPage, DemoList } from "@/components/orbi/SectionPage";

export const Route = createFileRoute("/oceano")({
  head: () => ({
    meta: [
      { title: "ORBI LIVE — Sistema oceânico" },
      { name: "description", content: 'Correntes, altura de ondas e temperatura da superfície do mar, observadas em escala global.' },
      { property: "og:title", content: "ORBI LIVE — Sistema oceânico" },
      { property: "og:description", content: 'Correntes, altura de ondas e temperatura da superfície do mar, observadas em escala global.' },
    ],
  }),
  component: Page,
});

const items: [string, string][] = [["Altura de onda", "2,4 m"], ["Corrente", "0,8 kt"], ["Temp. superfície", "21,7 °C"], ["Maré", "subindo"]];

function Page() {
  return (
    <SectionPage eyebrow="Oceano" title="Sistema oceânico" intro={'Correntes, altura de ondas e temperatura da superfície do mar, observadas em escala global.'}>
      <DemoList items={items} />
    </SectionPage>
  );
}
