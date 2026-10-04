import { describe, expect, test } from "bun:test";
import type { OrbiEvent } from "@/lib/orbi-events";
import {
  getNearbyDiscoveries,
  getNextDiscovery,
  historyHourFor,
  pickDiscovery,
  toDiscovery,
} from "./discovery";

const ev = (id: string, lat: number, lng: number, over: Partial<OrbiEvent> = {}): OrbiEvent => ({
  id,
  title: id,
  place: id,
  lat,
  lng,
  category: "quake",
  magnitude: "",
  updated: "",
  detectedMinutesAgo: 60,
  severity: "moderate",
  region: "americas",
  priority: 2,
  ...over,
});

describe("exploration engine", () => {
  const a = ev("a", 0, 0);
  const near = ev("near", 1, 1);
  const far = ev("far", 50, 120);

  test("nearby only returns real events inside the radius", () => {
    const items = getNearbyDiscoveries(a, [a, near, far]);
    expect(items.map((i) => i.event.id)).toEqual(["near"]);
  });

  test("history is only offered inside the 48h window", () => {
    expect(historyHourFor(ev("x", 0, 0, { detectedMinutesAgo: 90 }))).toBe(-3);
    expect(historyHourFor(ev("x", 0, 0, { detectedMinutesAgo: 60 * 50 }))).toBeNull();
    expect(
      toDiscovery(ev("x", 0, 0, { detectedMinutesAgo: 60 * 50 })).availableActions,
    ).not.toContain("history");
  });

  test("next discovery never repeats visited events", () => {
    expect(getNextDiscovery(a, [a, near, far], ["near"])?.event.id).toBe("far");
    expect(getNextDiscovery(a, [a])).toBeNull();
  });

  test("discover returns nothing when there is no real data", () => {
    expect(pickDiscovery([])).toBeNull();
    expect(pickDiscovery([a, near], ["a"])?.id).toBe("near");
  });
});
