import type { OrbiEvent } from "@/lib/orbi-events";
import type { en } from "@/lib/i18n/locales/en";

type Translations = typeof en;

export function eventHook(event: OrbiEvent, t: Translations): string {
  return t.discovery.hooks[event.category];
}

export function nextRelatedEvent(event: OrbiEvent, events: OrbiEvent[]): OrbiEvent | null {
  const candidates = events.filter((candidate) => candidate.id !== event.id);
  return (
    candidates.find((candidate) => candidate.region === event.region) ??
    candidates.find((candidate) => candidate.category === event.category) ??
    candidates[0] ??
    null
  );
}
