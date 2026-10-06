import { createFileRoute, Link } from "@tanstack/react-router";
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
        description:
          "Navegue por regiões, marcadores e pontos de observação. Uma superfície aberta para descoberta.",
      }),
    ],
    links: seoLinks("/explorar"),
  }),
  component: Page,
});

function Page() {
  const { t } = useTranslation();
  const page = t.pages.explore;
  const x = t.exploration;
  const available = [
    { to: "/eventos", label: x.catEvents },
    { to: "/earthquakes", label: x.catQuakes },
    { to: "/live", label: x.catCameras },
    { to: "/weather", label: x.catWeather },
    { to: "/oceano", label: x.catOceans },
    { to: "/natural-events", label: x.catFires },
    { to: "/espaco", label: x.catSpace },
  ] as const;

  return (
    <SectionPage eyebrow={page.eyebrow} title={page.title} intro={page.intro}>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">{page.body}</p>
      <Link
        to="/"
        search={{ discover: true }}
        className="focus-ring mt-8 inline-flex min-h-11 items-center gap-3 rounded-full border border-border/60 px-5 text-sm font-light text-foreground transition-colors hover:border-primary/50"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-discovery" aria-hidden />
        {x.discover} — <span className="text-muted-foreground">{x.discoverPath}</span>
      </Link>
      <p className="label-track mt-10 text-[11px] text-muted-foreground">{x.categories}</p>
      <p className="mt-1 text-xs text-muted-foreground">{x.gatewayIntro}</p>
      <ul className="mt-4 grid max-w-xl grid-cols-2 gap-x-6 sm:grid-cols-3">
        {available.map((c) => (
          <li key={c.label}>
            <Link
              to={c.to}
              className="focus-ring flex min-h-11 items-center text-sm font-light text-foreground/90 hover:text-primary"
            >
              {c.label}
            </Link>
          </li>
        ))}
        <li>
          <Link
            to="/"
            search={{ sat: 25544 }}
            className="focus-ring flex min-h-11 items-center text-sm font-light text-foreground/90 hover:text-primary"
          >
            {x.catSatellites}
          </Link>
        </li>
        {[x.catAircraft].map((label) => (
          <li
            key={label}
            className="flex min-h-11 flex-col justify-center text-sm font-light text-muted-foreground"
            aria-disabled="true"
          >
            {label}
            <span className="label-track text-[10px]">{x.notConnected}</span>
          </li>
        ))}
      </ul>
      <RelatedLinks
        label={t.pages.related}
        links={[
          { to: "/", label: t.pages.links.globe },
          { to: "/atmosfera", label: t.pages.links.globeAtmosphere },
          { to: "/oceano", label: t.pages.links.globeOcean },
          { to: "/earthquakes", label: t.pages.links.earthquakes },
          { to: "/natural-events", label: t.pages.links.naturalEvents },
          { to: "/timeline", label: t.pages.links.globeTimeline },
          { to: "/sobre", label: t.pages.links.sources },
        ]}
      />
    </SectionPage>
  );
}
