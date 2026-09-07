import { createFileRoute } from "@tanstack/react-router";

import { LivePage, LiveEventList, RelatedLinks } from "@/components/orbi/LivePage";
import { useNwsAlerts } from "@/lib/nws";
import { jsonLdScript, seoLinks, seoMeta, webPageJsonLd } from "@/lib/seo";

const TITLE = "Severe Weather Alerts & Live Weather Map | ORBI LIVE";
const DESCRIPTION =
  "Follow severe weather alerts and atmospheric conditions on a live planetary map: storms, floods, wind and temperature, with official NOAA and Windy data.";

export const Route = createFileRoute("/weather")({
  head: () => ({
    meta: seoMeta({ path: "/weather", title: TITLE, description: DESCRIPTION, locale: "en_US" }),
    links: seoLinks("/weather"),
    scripts: [
      jsonLdScript(webPageJsonLd({ path: "/weather", title: TITLE, description: DESCRIPTION })),
    ],
  }),
  component: Page,
});

function Page() {
  const { data } = useNwsAlerts({ severity: "severe", limit: 150 });

  return (
    <LivePage
      eyebrow="Weather"
      title="Severe weather events happening now"
      intro="Active severe weather alerts issued by NOAA / National Weather Service, alongside the atmospheric layer of ORBI LIVE: wind, temperature, humidity and pressure for any point you observe on the globe."
    >
      <LiveEventList
        events={data}
        emptyLabel="No severe alerts are active right now, or the source is temporarily unavailable."
        sourceLabel="Sources: NOAA / National Weather Service (alerts) and Windy GFS (atmospheric conditions)."
      />
      <RelatedLinks
        links={[
          { to: "/", label: "Explore Earth in real time on the ORBI LIVE globe" },
          { to: "/earthquakes", label: "Live earthquake map — earthquakes today" },
          { to: "/natural-events", label: "Natural events happening on Earth today" },
          { to: "/atmosfera", label: "Camada atmosférica do planeta" },
        ]}
      />
    </LivePage>
  );
}
