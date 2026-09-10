import { createFileRoute } from "@tanstack/react-router";
import { seoLinks, seoMeta } from "@/lib/seo";
import { SectionPage } from "@/components/orbi/SectionPage";
import { RelatedLinks } from "@/components/orbi/LivePage";
import { useTranslation } from "@/lib/i18n";

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      ...seoMeta({
        path: "/eventos",
        title: "ORBI LIVE — Eventos planetários",
        description: "Registro contínuo de fenômenos naturais observados na superfície e na atmosfera.",
      }),
    ],
    links: seoLinks("/eventos"),
  }),
  component: Page,
});

function Page() {
  const { t } = useTranslation();
  const page = t.pages.events;

  return (
    <SectionPage eyebrow={page.eyebrow} title={page.title} intro={page.intro}>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">{page.body}</p>
      <RelatedLinks
        label={t.pages.related}
        links={[
          { to: "/natural-events", label: t.pages.links.naturalEvents },
          { to: "/earthquakes", label: t.pages.links.earthquakes },
          { to: "/", label: t.pages.links.globeEvents },
        ]}
      />
    </SectionPage>
  );
}
