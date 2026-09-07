import { createFileRoute } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo";
import { SectionPage } from "@/components/orbi/SectionPage";
import { RelatedLinks } from "@/components/orbi/LivePage";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "ORBI LIVE — Linha do tempo" },
      {
        name: "description",
        content:
          "Reconstrução temporal dos eventos observados, permitindo avançar e retroceder na história recente do planeta.",
      },
      { property: "og:title", content: "ORBI LIVE — Linha do tempo" },
      {
        property: "og:description",
        content:
          "Reconstrução temporal dos eventos observados, permitindo avançar e retroceder na história recente do planeta.",
      },
    ],
    links: seoLinks("/timeline"),
  }),
  component: Page,
});

const links = [
  { to: "/", label: "Usar a linha do tempo no globo" },
  { to: "/earthquakes", label: "Terremotos das últimas horas" },
];

function Page() {
  return (
    <SectionPage
      eyebrow="Timeline"
      title="Linha do tempo"
      intro={
        "Reconstrução temporal dos eventos observados, permitindo avançar e retroceder na história recente do planeta."
      }
    >
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {
          "A linha do tempo vive no globo: recue nas últimas horas para ver apenas o que já tinha sido detetado nesse momento. O ORBI não apresenta previsões que as fontes não forneçam."
        }
      </p>
      <RelatedLinks links={links} />
    </SectionPage>
  );
}
