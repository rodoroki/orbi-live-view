import { createFileRoute } from "@tanstack/react-router";
import { SectionPage, DemoList } from "@/components/orbi/SectionPage";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "ORBI LIVE — Linha do tempo" },
      { name: "description", content: 'Reconstrução temporal dos eventos observados, permitindo avançar e retroceder na história recente do planeta.' },
      { property: "og:title", content: "ORBI LIVE — Linha do tempo" },
      { property: "og:description", content: 'Reconstrução temporal dos eventos observados, permitindo avançar e retroceder na história recente do planeta.' },
    ],
  }),
  component: Page,
});

const items: [string, string][] = [["Janela", "últimas 24 h"], ["Resolução", "10 min"], ["Registros", "1 284"]];

function Page() {
  return (
    <SectionPage eyebrow="Timeline" title="Linha do tempo" intro={'Reconstrução temporal dos eventos observados, permitindo avançar e retroceder na história recente do planeta.'}>
      <DemoList items={items} />
    </SectionPage>
  );
}
