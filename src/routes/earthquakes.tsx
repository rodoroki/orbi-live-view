import { createFileRoute } from "@tanstack/react-router";

import { LivePage, LiveEventList, RelatedLinks } from "@/components/orbi/LivePage";
import { useUsgsEarthquakes } from "@/lib/usgs";
import { jsonLdScript, seoLinks, seoMeta, webPageJsonLd } from "@/lib/seo";

const TITLE = "Live Earthquake Map — Earthquakes Today | ORBI LIVE";
const DESCRIPTION =
  "See earthquakes detected around the world in the last 48 hours, with magnitude, location and time. A live earthquake map built on official USGS data.";

export const Route = createFileRoute("/earthquakes")({
  head: () => ({
    meta: seoMeta({
      path: "/earthquakes",
      title: TITLE,
      description: DESCRIPTION,
      locale: "en_US",
    }),
    links: seoLinks("/earthquakes"),
    scripts: [
      jsonLdScript(webPageJsonLd({ path: "/earthquakes", title: TITLE, description: DESCRIPTION })),
    ],
  }),
  component: Page,
});

function Page() {
  const { data } = useUsgsEarthquakes({ days: 2, minMagnitude: 2.5, limit: 200 });

  return (
    <LivePage
      eyebrow="Earthquakes"
      title="Earthquakes happening around the world"
      intro="Earthquakes recorded in the last 48 hours by the United States Geological Survey, listed with magnitude, place and detection time. Open the planetary map to see where each one happened and what else is unfolding nearby."
    >
      <LiveEventList
        events={data}
        emptyLabel="No earthquakes above magnitude 2.5 have been recorded in the last 48 hours, or the source is temporarily unavailable."
        sourceLabel="Source: USGS Earthquake Hazards Program — updated continuously."
      />
      <RelatedLinks
        links={[
          { to: "/", label: "Explore Earth in real time on the ORBI LIVE globe" },
          { to: "/natural-events", label: "Natural events happening on Earth today" },
          { to: "/weather", label: "Severe weather alerts and atmospheric conditions" },
          { to: "/sobre", label: "Data sources and transparency" },
        ]}
      />
    </LivePage>
  );
}
