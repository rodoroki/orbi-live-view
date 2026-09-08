import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";

import BroadcastOverlay from "@/components/orbi/live/BroadcastOverlay";
import LiveStage from "@/components/orbi/live/LiveStage";
import { useSceneSelector } from "@/lib/live/selector";
import { jsonLdScript, seoLinks, seoMeta, webPageJsonLd } from "@/lib/seo";

const TITLE = "ORBI LIVE — Live window to the world";
const DESCRIPTION =
  "A continuous cinematic window to the planet: real live camera views from around the world, with location, local time and atmospheric context.";

const searchSchema = z.object({
  mode: z.enum(["broadcast"]).optional(),
});

export const Route = createFileRoute("/live")({
  validateSearch: searchSchema,
  head: () => ({
    meta: seoMeta({ path: "/live", title: TITLE, description: DESCRIPTION, locale: "en_US" }),
    links: seoLinks("/live"),
    scripts: [
      jsonLdScript(webPageJsonLd({ path: "/live", title: TITLE, description: DESCRIPTION })),
    ],
  }),
  component: LiveRoute,
});

function LiveRoute() {
  const { mode } = Route.useSearch();
  const broadcast = mode === "broadcast";
  const { scene, isLoading, next } = useSceneSelector();

  // No modo transmissão a cena ocupa tudo e não há scroll.
  useEffect(() => {
    if (!broadcast) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [broadcast]);

  return (
    <main
      className={
        broadcast
          ? "fixed inset-0 z-50 overflow-hidden bg-background"
          : "relative h-[100svh] w-full overflow-hidden bg-background"
      }
    >
      <h1 className="sr-only">ORBI LIVE — live window to the world</h1>
      <LiveStage scene={scene} isLoading={isLoading} onImageError={next} />
      <BroadcastOverlay scene={scene} />
    </main>
  );
}
