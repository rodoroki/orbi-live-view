import { createFileRoute } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo";
import { SectionPage } from "@/components/orbi/SectionPage";
import { RelatedLinks } from "@/components/orbi/LivePage";

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      { title: "ORBI LIVE — Eventos planetários" },
      {
        name: "description",
        content:
          "Registro contínuo de fenômenos naturais observados na superfície e na atmosfera. Fontes reais serão conectadas em etapa posterior.",
      },
      { property: "og:title", content: "ORBI LIVE — Eventos planetários" },
      {
        property: "og:description",
        content:
          "Registro contínuo de fenômenos naturais observados na superfície e na atmosfera. Fontes reais serão conectadas em etapa posterior.",
      },
    ],
    links: seoLinks("/eventos"),
  }),
  component: Page,
});

const links = [
  { to: "/natural-events", label: "Eventos naturais ao vivo (NASA EONET)" },
  { to: "/earthquakes", label: "Terremotos ao vivo (USGS)" },
  { to: "/", label: "Ver no globo ORBI LIVE" },
];

function Page() {
  return (
    <SectionPage
      eyebrow="Eventos"
      title="Eventos planetários"
      intro={
        "Registro contínuo de fenômenos naturais observados na superfície e na atmosfera. Fontes reais serão conectadas em etapa posterior."
      }
    >
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {
          "Esta página é uma porta de entrada temática. Os registos verificados são apresentados nas páginas ligadas abaixo, sempre com a fonte original identificada."
        }
      </p>
      <RelatedLinks links={links} />
    </SectionPage>
  );
}
