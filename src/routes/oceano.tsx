import { createFileRoute } from "@tanstack/react-router";
import { seoLinks } from "@/lib/seo";
import { SectionPage } from "@/components/orbi/SectionPage";
import { RelatedLinks } from "@/components/orbi/LivePage";

export const Route = createFileRoute("/oceano")({
  head: () => ({
    meta: [
      { title: "ORBI LIVE — Sistema oceânico" },
      {
        name: "description",
        content:
          "Correntes, altura de ondas e temperatura da superfície do mar, observadas em escala global.",
      },
      { property: "og:title", content: "ORBI LIVE — Sistema oceânico" },
      {
        property: "og:description",
        content:
          "Correntes, altura de ondas e temperatura da superfície do mar, observadas em escala global.",
      },
    ],
    links: seoLinks("/oceano"),
  }),
  component: Page,
});

const links = [
  { to: "/natural-events", label: "Eventos naturais ao vivo (NASA EONET)" },
  { to: "/", label: "Ver o oceano no globo ORBI LIVE" },
];

function Page() {
  return (
    <SectionPage
      eyebrow="Oceano"
      title="Sistema oceânico"
      intro={
        "Correntes, altura de ondas e temperatura da superfície do mar, observadas em escala global."
      }
    >
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {
          "O ORBI LIVE ainda não publica medições oceânicas próprias. Os eventos oceânicos observados aparecem no globo e nas páginas ligadas abaixo."
        }
      </p>
      <RelatedLinks links={links} />
    </SectionPage>
  );
}
