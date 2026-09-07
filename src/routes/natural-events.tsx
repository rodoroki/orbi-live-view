import { createFileRoute } from "@tanstack/react-router";

import { LivePage, LiveEventList, RelatedLinks } from "@/components/orbi/LivePage";
import { useEonetEvents } from "@/lib/eonet";
import { jsonLdScript, seoLinks, seoMeta, webPageJsonLd } from "@/lib/seo";

const TITLE = "Natural Events Map — Wildfires, Volcanoes, Storms | ORBI LIVE";
const DESCRIPTION =
  "Track natural events happening on Earth right now: wildfires, volcanic activity, storms, floods and sea ice, observed through NASA EONET and shown on a live planetary map.";

export const Route = createFileRoute("/natural-events")({
  head: () => ({
    meta: seoMeta({
      path: "/natural-events",
      title: TITLE,
      description: DESCRIPTION,
      locale: "en_US",
    }),
    links: seoLinks("/natural-events"),
    scripts: [
      jsonLdScript(
        webPageJsonLd({ path: "/natural-events", title: TITLE, description: DESCRIPTION }),
      ),
    ],
  }),
  component: Page,
});

function Page() {
  const { data } = useEonetEvents({ days: 20, limit: 250 });

  return (
    <LivePage
      eyebrow="Natural events"
      title="Natural events happening on Earth"
      intro="Wildfires, volcanic activity, storms, floods and sea ice observed by NASA's Earth Observatory Natural Event Tracker. Each entry is a real, currently open event — nothing here is simulated."
    >
      <LiveEventList
        events={data}
        emptyLabel="No open natural events were returned, or the source is temporarily unavailable."
        sourceLabel="Source: NASA EONET v3 — open natural events."
      />
      <RelatedLinks
        links={[
          { to: "/", label: "Explore Earth in real time on the ORBI LIVE globe" },
          { to: "/earthquakes", label: "Live earthquake map — earthquakes today" },
          { to: "/weather", label: "Severe weather alerts and atmospheric conditions" },
          { to: "/sobre", label: "Data sources and transparency" },
        ]}
      />
    </LivePage>
  );
}
