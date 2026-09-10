import { createFileRoute } from "@tanstack/react-router";
import { seoLinks, seoMeta } from "@/lib/seo";
import { SectionPage } from "@/components/orbi/SectionPage";
import { RelatedLinks } from "@/components/orbi/LivePage";
import { useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/explorar")({
  head: () => ({
    meta: [
      ...seoMeta({
        path: "/explorar",
        title: "ORBI LIVE — Explorar o planeta",
        description: "Navegue por regiões, marcadores e pontos de observação. Uma superfície aberta para descoberta.",
      }),
    ],
    links: seoLinks("/explorar"),
  }),
  component: Page,
});

function Page() {
  const { t } = useTranslation();
  const page = t.pages.explore;

  return (
    <SectionPage eyebrow={page.eyebrow} title={page.title} intro={page.intro}>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">{page.body}</p>
      <RelatedLinks
        label={t.pages.related}
        links={[
          { to: "/", label: t.pages.links.globe },
          { to: "/sobre", label: t.pages.links.sources },
        ]}
      />
    </SectionPage>
  );
}
