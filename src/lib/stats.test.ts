import { describe, expect, it } from "vitest";
import { computeStats, interpolateStat, masterworkOptions, roundHalfToEven } from "./stats.ts";
import { buildDemoBundle } from "./demoData.ts";
import { STAT } from "../types.ts";

describe("roundHalfToEven", () => {
  it("rounds halves to the even neighbor", () => {
    expect(roundHalfToEven(2.5)).toBe(2);
    expect(roundHalfToEven(3.5)).toBe(4);
    expect(roundHalfToEven(2.4)).toBe(2);
    expect(roundHalfToEven(2.6)).toBe(3);
    expect(roundHalfToEven(7)).toBe(7);
  });
});

describe("interpolateStat", () => {
  const curve = [
    { value: 0, weight: 0 },
    { value: 50, weight: 60 },
    { value: 100, weight: 100 },
  ];

  it("interpolates linearly between points", () => {
    expect(interpolateStat(0, curve)).toBe(0);
    expect(interpolateStat(25, curve)).toBe(30);
    expect(interpolateStat(50, curve)).toBe(60);
    expect(interpolateStat(75, curve)).toBe(80);
    expect(interpolateStat(100, curve)).toBe(100);
  });

  it("clamps values outside the curve", () => {
    expect(interpolateStat(-10, curve)).toBe(0);
    expect(interpolateStat(150, curve)).toBe(100);
  });

  it("passes through when there is no curve", () => {
    expect(interpolateStat(42, [])).toBe(42);
  });
});

describe("computeStats", () => {
  const bundle = buildDemoBundle();
  const weapon = bundle.weapons[1001]; // demo 140 hand cannon, base range 52

  it("returns base display values with no perks", () => {
    const stats = computeStats(weapon, bundle, {
      perks: [],
      masterworkStat: null,
      includeConditional: false,
    });
    const range = stats.find((s) => s.statHash === STAT.RANGE)!;
    expect(range.display).toBe(52);
    expect(range.display).toBe(range.baseDisplay);
  });

  it("applies perk investment stats", () => {
    const fullBore = bundle.perks[9101]; // +15 range, -10 stability, -5 handling
    const stats = computeStats(weapon, bundle, {
      perks: [fullBore],
      masterworkStat: null,
      includeConditional: false,
    });
    expect(stats.find((s) => s.statHash === STAT.RANGE)!.display).toBe(67);
    expect(stats.find((s) => s.statHash === STAT.STABILITY)!.display).toBe(38);
    expect(stats.find((s) => s.statHash === STAT.HANDLING)!.display).toBe(50);
  });

  it("applies masterwork +10", () => {
    const stats = computeStats(weapon, bundle, {
      perks: [],
      masterworkStat: STAT.RELOAD,
      includeConditional: false,
    });
    expect(stats.find((s) => s.statHash === STAT.RELOAD)!.display).toBe(60);
  });

  it("skips conditional stats unless enabled", () => {
    const keepAway = bundle.perks[9310]; // conditional +10 range, +30 reload
    const off = computeStats(weapon, bundle, {
      perks: [keepAway],
      masterworkStat: null,
      includeConditional: false,
    });
    expect(off.find((s) => s.statHash === STAT.RANGE)!.display).toBe(52);

    const on = computeStats(weapon, bundle, {
      perks: [keepAway],
      masterworkStat: null,
      includeConditional: true,
    });
    expect(on.find((s) => s.statHash === STAT.RANGE)!.display).toBe(62);
  });
});

describe("masterworkOptions", () => {
  const bundle = buildDemoBundle();

  it("offers standard stats for a hand cannon", () => {
    const opts = masterworkOptions(bundle.weapons[1001]);
    expect(opts).toContain(STAT.RANGE);
    expect(opts).toContain(STAT.HANDLING);
    expect(opts).not.toContain(STAT.CHARGE_TIME);
  });

  it("offers charge time for a fusion rifle", () => {
    const opts = masterworkOptions(bundle.weapons[1010]);
    expect(opts).toContain(STAT.CHARGE_TIME);
  });
});
