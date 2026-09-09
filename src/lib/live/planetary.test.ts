import { beforeEach, describe, expect, test } from "bun:test";

import {
  MAX_ACTIVE_DISCOVERY_REGIONS,
  PLANETARY_REGIONS,
  planetaryWindow,
  recordRegionResult,
  regionHealth,
  resetRegionHealth,
} from "./planetary";

describe("planetary discovery", () => {
  beforeEach(() => resetRegionHealth());

  test("universo é muito maior que o catálogo anterior", () => {
    expect(PLANETARY_REGIONS.length).toBeGreaterThan(60);
    expect(new Set(PLANETARY_REGIONS.map((r) => r.id)).size).toBe(PLANETARY_REGIONS.length);
  });

  test("janela respeita o request budget", () => {
    expect(planetaryWindow(0).length).toBe(MAX_ACTIVE_DISCOVERY_REGIONS);
  });

  test("round-robin percorre o planeta ao longo dos ciclos", () => {
    const visited = new Set<string>();
    for (let offset = 0; offset < PLANETARY_REGIONS.length; offset += 1) {
      for (const region of planetaryWindow(offset)) visited.add(region.continent);
    }
    expect(visited.size).toBeGreaterThanOrEqual(5);
  });

  test("região vazia entra em cooldown e sai da janela", () => {
    const now = Date.now();
    const first = planetaryWindow(0, 4, { now })[0]!;
    recordRegionResult(first.id, { count: 0 }, now);
    expect(regionHealth(first.id).state).toBe("empty");
    const next = planetaryWindow(0, 4, { now: now + 1_000 });
    expect(next.some((r) => r.id === first.id)).toBe(false);
  });

  test("região saudável continua elegível", () => {
    const now = Date.now();
    const region = PLANETARY_REGIONS[0]!;
    recordRegionResult(region.id, { count: 9 }, now);
    expect(regionHealth(region.id).state).toBe("healthy");
    expect(regionHealth(region.id).cooledUntil).toBeLessThanOrEqual(now);
  });
});
