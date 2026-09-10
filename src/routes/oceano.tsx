import { createFileRoute } from "@tanstack/react-router";
import { seoLinks, seoMeta } from "@/lib/seo";
import { SectionPage } from "@/components/orbi/SectionPage";
import { RelatedLinks } from "@/components/orbi/LivePage";
import { useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/oceano")({
  head: () => ({
    meta: [
      ...seoMeta({
        path: "/oceano",
        title: "ORBI LIVE — Sistema oceânico",
        description: "Correntes, altura de ondas e temperatura da superfície do mar, observadas em escala global.",
      }),
    ],
    links: seoLinks("/oceano"),
  }),
  component: Page,
});

function Page() {
  const { t } = useTranslation();
  const page = t.pages.ocean;

  return (
    <SectionPage eyebrow={page.eyebrow} title={page.title} intro={page.intro}>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">{page.body}</p>
      <RelatedLinks
        label={t.pages.related}
        links={[
          { to: "/natural-events", label: t.pages.links.naturalEvents },
          { to: "/", label: t.pages.links.globeOcean },
        ]}
      />
    </SectionPage>
  );
}
