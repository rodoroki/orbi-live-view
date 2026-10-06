import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { seoLinks, seoMeta } from "@/lib/seo";
import { SectionPage } from "@/components/orbi/SectionPage";
import { useTranslation } from "@/lib/i18n";
import { getNasaMedia, SPACE_TOPICS } from "@/lib/space.functions";

type Topic = (typeof SPACE_TOPICS)[number];

/** Ponte real: temas que correspondem a objetos rastreáveis no catálogo orbital. */
const TRACKABLE: Partial<Record<Topic, number>> = {
  hubble: 20580,
  "international space station": 25544,
};

export const Route = createFileRoute("/espaco")({
  validateSearch: (s: Record<string, unknown>): { topic?: Topic } =>
    SPACE_TOPICS.includes(s["topic"] as Topic) ? { topic: s["topic"] as Topic } : {},
  head: () => ({
    meta: [
      ...seoMeta({
        path: "/espaco",
        title: "ORBI LIVE — Space, from NASA",
        description:
          "Discover real NASA images and science: telescopes, planets, nebulae and the Sun. NASA content, not real-time tracking.",
      }),
    ],
    links: seoLinks("/espaco"),
  }),
  component: Page,
});

function Page() {
  const { t } = useTranslation();
  const x = t.exploration;
  const { topic: initial } = Route.useSearch();
  const [topic, setTopic] = useState<Topic>(initial ?? SPACE_TOPICS[0]);
  const [index, setIndex] = useState(0);

  const q = useQuery({
    queryKey: ["nasa-media", topic],
    queryFn: async () => {
      const res = await getNasaMedia({ data: { topic } });
      if (res.error) throw new Error(res.error);
      return res.items;
    },
    staleTime: 60 * 60_000,
    retry: 1,
  });

  const items = q.data ?? [];
  const item = items.length ? items[index % items.length] : null;
  const norad = TRACKABLE[topic];

  const next = () => {
    if (items.length > 1 && index + 1 < items.length) setIndex(index + 1);
    else {
      const i = SPACE_TOPICS.indexOf(topic);
      setTopic(SPACE_TOPICS[(i + 1) % SPACE_TOPICS.length]!);
      setIndex(0);
    }
  };

  return (
    <SectionPage eyebrow={x.spaceTitle} title={x.spaceTitle} intro={x.spaceIntro}>
      <p className="label-track mt-6 inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-[10px] text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full border border-muted-foreground" aria-hidden />
        {x.spaceNotTracking}
      </p>

      <div className="mt-6 flex flex-wrap gap-x-4" role="group" aria-label={x.spaceTopic}>
        {SPACE_TOPICS.map((tp) => (
          <Button
            key={tp}
            variant="ghost"
            size="sm"
            type="button"
            aria-pressed={tp === topic}
            onClick={() => {
              setTopic(tp);
              setIndex(0);
            }}
            className={`focus-ring min-h-11 px-0 text-xs capitalize hover:bg-transparent ${tp === topic ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            {tp}
          </Button>
        ))}
      </div>

      <div className="mt-6 max-w-2xl" aria-live="polite">
        {q.isPending && <p className="text-sm text-muted-foreground">{x.spaceLoading}</p>}
        {(q.isError || (!q.isPending && !item)) && (
          <p className="text-sm text-muted-foreground">{x.spaceError}</p>
        )}
        {item && (
          <figure className="animate-fade-in">
            <div className="aspect-video overflow-hidden rounded-md bg-muted">
              <img
                src={item.image}
                alt={item.title}
                className="size-full object-cover"
                loading="lazy"
              />
            </div>
            <figcaption className="mt-4">
              <h2 className="text-lg font-light text-foreground">{item.title}</h2>
              <p className="label-track mt-1 text-[11px] text-muted-foreground">
                {item.dateCreated.slice(0, 10)}
                {item.center ? ` · NASA ${item.center}` : ""}
              </p>
              {item.description && (
                <p className="mt-3 line-clamp-5 text-sm font-light leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              )}
              <p className="mt-4 text-[11px] text-muted-foreground">
                {x.spaceSource} ·{" "}
                <a
                  className="focus-ring underline underline-offset-2 hover:text-foreground"
                  href={`https://images.nasa.gov/details/${encodeURIComponent(item.nasaId)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.nasaId}
                </a>{" "}
                ·{" "}
                <a
                  className="focus-ring underline underline-offset-2 hover:text-foreground"
                  href="https://www.nasa.gov/nasa-brand-center/images-and-media/"
                  target="_blank"
                  rel="noreferrer"
                >
                  {x.spaceUsage}
                </a>
              </p>
            </figcaption>
          </figure>
        )}
        <div className="mt-4 flex flex-wrap gap-x-6">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={next}
            className="focus-ring label-track min-h-11 px-0 text-xs text-primary hover:bg-transparent hover:opacity-70"
          >
            {x.spaceNext} <ArrowRight className="h-3 w-3" strokeWidth={1.4} />
          </Button>
          {norad && (
            <Link
              to="/"
              search={{ sat: norad }}
              className="focus-ring label-track flex min-h-11 items-center text-xs text-foreground/90 hover:opacity-70"
            >
              {x.spaceTrack}
            </Link>
          )}
        </div>
      </div>
    </SectionPage>
  );
}
