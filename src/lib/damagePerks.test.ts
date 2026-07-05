import { describe, expect, it } from "vitest";
import { combinedPerkMultipliers, damagePerkFor } from "./damagePerks.ts";
import { computeTtk, CRUCIBLE_HP } from "./ttk.ts";
import { tokenMatchesWeapon } from "./perkAliases.ts";

describe("damagePerkFor", () => {
  it("matches perk names case-insensitively", () => {
    expect(damagePerkFor("Kill Clip")?.damageMult).toBe(1.25);
    expect(damagePerkFor("kill clip")?.damageMult).toBe(1.25);
    expect(damagePerkFor("Outlaw")).toBeUndefined();
  });
});

describe("combinedPerkMultipliers", () => {
  it("multiplies damage perks together", () => {
    const m = combinedPerkMultipliers(["Kill Clip", "High-Impact Reserves"]);
    expect(m.damage).toBeCloseTo(1.25 * 1.097, 6);
    expect(m.rpm).toBe(1);
  });

  it("applies RPM perks separately", () => {
    const m = combinedPerkMultipliers(["Desperado"]);
    expect(m.damage).toBe(1);
    expect(m.rpm).toBeCloseTo(1.3, 6);
  });

  it("ignores unknown perks", () => {
    expect(combinedPerkMultipliers(["Outlaw", "Zen Moment"])).toEqual({ damage: 1, rpm: 1 });
  });
});

describe("perk-adjusted TTK", () => {
  it("Kill Clip turns a 140 hand cannon into a 3-tap", () => {
    // base: 70 crit → 4 crits vs 230 HP (1.29s)
    const base = computeTtk({ label: "", critDamage: 70, bodyDamage: 47, rpm: 140 }, CRUCIBLE_HP)!;
    expect(base.optimalShots).toBe(4);

    const mult = combinedPerkMultipliers(["Kill Clip"]).damage;
    const buffed = computeTtk(
      { label: "", critDamage: 70 * mult, bodyDamage: 47 * mult, rpm: 140 },
      CRUCIBLE_HP,
    )!;
    expect(buffed.optimalShots).toBe(3); // 3 × 87.5 = 262.5 ≥ 230
    expect(buffed.optimalTtk).toBeCloseTo(2 * (60 / 140), 2); // ≈ 0.86s
  });

  it("Desperado shortens TTK via fire rate, not shot count", () => {
    const rpmMult = combinedPerkMultipliers(["Desperado"]).rpm;
    const base = computeTtk({ label: "", critDamage: 28, bodyDamage: 18, rpm: 540 }, CRUCIBLE_HP)!;
    const fast = computeTtk(
      { label: "", critDamage: 28, bodyDamage: 18, rpm: 540 * rpmMult },
      CRUCIBLE_HP,
    )!;
    expect(fast.optimalShots).toBe(base.optimalShots);
    expect(fast.optimalTtk).toBeLessThan(base.optimalTtk);
  });
});

describe("perk alias search", () => {
  const perks = ["kill clip", "outlaw", "full bore", "bait and switch"].join("\n");

  it("matches weapon name and type substrings", () => {
    expect(tokenMatchesWeapon("transmission", "last transmission", "hand cannon", perks)).toBe(true);
    expect(tokenMatchesWeapon("hand", "last transmission", "hand cannon", perks)).toBe(true);
  });

  it("matches full perk names", () => {
    expect(tokenMatchesWeapon("outlaw", "x", "hand cannon", perks)).toBe(true);
    expect(tokenMatchesWeapon("rampage", "x", "hand cannon", perks)).toBe(false);
  });

  it("matches community aliases", () => {
    expect(tokenMatchesWeapon("kc", "x", "hand cannon", perks)).toBe(true);
    expect(tokenMatchesWeapon("bns", "x", "hand cannon", perks)).toBe(true);
    expect(tokenMatchesWeapon("mkc", "x", "hand cannon", perks)).toBe(false);
  });

  it("matches weapon-type aliases", () => {
    expect(tokenMatchesWeapon("smg", "x", "submachine gun", "")).toBe(true);
    expect(tokenMatchesWeapon("hc", "x", "hand cannon", "")).toBe(true);
    expect(tokenMatchesWeapon("smg", "x", "hand cannon", "")).toBe(false);
  });
});
