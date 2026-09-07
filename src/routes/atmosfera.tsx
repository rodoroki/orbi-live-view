import { createFileRoute } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo";
import { SectionPage } from "@/components/orbi/SectionPage";
import { RelatedLinks } from "@/components/orbi/LivePage";

export const Route = createFileRoute("/atmosfera")({
  head: () => ({
    meta: [
      { title: "ORBI LIVE — Camada atmosférica" },
      {
        name: "description",
        content:
          "Vento, temperatura, umidade e pressão apresentados como camadas sobre o mapa planetário.",
      },
      { property: "og:title", content: "ORBI LIVE — Camada atmosférica" },
      {
        property: "og:description",
        content:
          "Vento, temperatura, umidade e pressão apresentados como camadas sobre o mapa planetário.",
      },
    ],
    links: seoLinks("/atmosfera"),
  }),
  component: Page,
});

const links = [
  { to: "/weather", label: "Alertas meteorológicos ao vivo (NOAA/NWS)" },
  { to: "/", label: "Ver camadas atmosféricas no globo" },
];

function Page() {
  return (
    <SectionPage
      eyebrow="Atmosfera"
      title="Camada atmosférica"
      intro={
        "Vento, temperatura, umidade e pressão apresentados como camadas sobre o mapa planetário."
      }
    >
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {
          "As condições atmosféricas são apresentadas sobre o globo, a partir das fontes ligadas abaixo. Esta página não publica valores próprios."
        }
      </p>
      <RelatedLinks links={links} />
    </SectionPage>
  );
}
