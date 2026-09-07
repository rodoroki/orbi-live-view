import { createFileRoute } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo";
import { SectionPage } from "@/components/orbi/SectionPage";
import { RelatedLinks } from "@/components/orbi/LivePage";

export const Route = createFileRoute("/explorar")({
  head: () => ({
    meta: [
      { title: "ORBI LIVE — Explorar o planeta" },
      {
        name: "description",
        content:
          "Navegue por regiões, marcadores e pontos de observação. Uma superfície aberta para descoberta.",
      },
      { property: "og:title", content: "ORBI LIVE — Explorar o planeta" },
      {
        property: "og:description",
        content:
          "Navegue por regiões, marcadores e pontos de observação. Uma superfície aberta para descoberta.",
      },
    ],
    links: seoLinks("/explorar"),
  }),
  component: Page,
});

const links = [
  { to: "/", label: "Explorar o globo ORBI LIVE" },
  { to: "/sobre", label: "Fontes de dados e transparência" },
];

function Page() {
  return (
    <SectionPage
      eyebrow="Explorar"
      title="Explorar o planeta"
      intro={
        "Navegue por regiões, marcadores e pontos de observação. Uma superfície aberta para descoberta."
      }
    >
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {
          "A exploração acontece no globo: rode, aproxime e selecione um sinal para ver o que a fonte declara sobre ele."
        }
      </p>
      <RelatedLinks links={links} />
    </SectionPage>
  );
}
