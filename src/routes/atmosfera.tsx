import { createFileRoute } from "@tanstack/react-router";
import { seoLinks, seoMeta } from "@/lib/seo";
import { SectionPage } from "@/components/orbi/SectionPage";
import { RelatedLinks } from "@/components/orbi/LivePage";
import { useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/atmosfera")({
  head: () => ({
    meta: [
      ...seoMeta({
        path: "/atmosfera",
        title: "ORBI LIVE — Camada atmosférica",
        description: "Vento, temperatura, umidade e pressão apresentados como camadas sobre o mapa planetário.",
      }),
    ],
    links: seoLinks("/atmosfera"),
  }),
  component: Page,
});

function Page() {
  const { t } = useTranslation();
  const page = t.pages.atmosphere;

  return (
    <SectionPage eyebrow={page.eyebrow} title={page.title} intro={page.intro}>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">{page.body}</p>
      <RelatedLinks
        label={t.pages.related}
        links={[
          { to: "/weather", label: t.pages.links.weather },
          { to: "/", label: t.pages.links.globeAtmosphere },
        ]}
      />
    </SectionPage>
  );
}
