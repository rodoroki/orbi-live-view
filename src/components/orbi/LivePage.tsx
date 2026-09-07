import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { CATEGORY_META, type OrbiEvent } from "@/lib/orbi-events";

/**
 * Página de conteúdo indexável do ORBI.
 * Texto real no DOM (não dentro do canvas) + lista viva de eventos.
 */
export function LivePage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children?: ReactNode;
}) {
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col px-8 py-24 md:px-10">
      <p className="label-track text-primary">{eyebrow}</p>
      <h1 className="mt-6 text-4xl font-medium tracking-tight">{title}</h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">{intro}</p>
      {children}
    </article>
  );
}

export function LiveEventList({
  events,
  emptyLabel,
  sourceLabel,
}: {
  events: OrbiEvent[] | null | undefined;
  emptyLabel: string;
  sourceLabel: string;
}) {
  if (!events || events.length === 0) {
    return <p className="mt-10 text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <>
      <ul className="mt-10 flex flex-col">
        {events.slice(0, 20).map((event) => {
          const meta = CATEGORY_META[event.category];
          return (
            <li
              key={event.id}
              className="flex items-baseline justify-between gap-6 border-t border-border py-4 last:border-b"
            >
              <span className="flex min-w-0 items-baseline gap-2">
                <span
                  className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: meta?.color ?? "var(--primary)" }}
                />
                <span className="truncate text-sm text-foreground">{event.title}</span>
              </span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {event.updated}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-muted-foreground/70">{sourceLabel}</p>
    </>
  );
}

export function RelatedLinks({
  links,
  label = "Related pages",
}: {
  links: { to: string; label: string }[];
  label?: string;
}) {
  return (
    <nav className="mt-16 flex flex-col gap-2" aria-label={label}>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className="focus-ring text-sm text-primary underline-offset-4 hover:underline"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
