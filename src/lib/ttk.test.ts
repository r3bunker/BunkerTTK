import { describe, expect, it } from "vitest";
import {
  computeTtk,
  computeTtkAtWeaponsStat,
  CRUCIBLE_HP,
  findArchetype,
  weaponsStatMultiplier,
} from "./ttk.ts";

describe("findArchetype", () => {
  it("matches by weapon type and nearest RPM", () => {
    expect(findArchetype("Hand Cannon", 140)?.label).toBe("Adaptive (140)");
    expect(findArchetype("Hand Cannon", 122)?.label).toBe("Aggressive (120)");
    expect(findArchetype("Submachine Gun", 900)?.label).toBe("Lightweight (900)");
  });

  it("returns undefined for unknown types", () => {
    expect(findArchetype("Kazoo", 100)).toBeUndefined();
  });

  it("falls back to the first entry without an RPM stat", () => {
    expect(findArchetype("Combat Bow", undefined)).toBeDefined();
  });
});

describe("weaponsStatMultiplier", () => {
  it("gives no bonus at or below 100", () => {
    expect(weaponsStatMultiplier(100)).toBe(1);
    expect(weaponsStatMultiplier(40)).toBe(1);
  });

  it("adds 0.05% per point above 100, capped at +5%", () => {
    expect(weaponsStatMultiplier(150)).toBeCloseTo(1.025, 6);
    expect(weaponsStatMultiplier(200)).toBeCloseTo(1.05, 6);
    expect(weaponsStatMultiplier(250)).toBeCloseTo(1.05, 6);
  });
});

describe("computeTtk vs flat 230 HP Crucible", () => {
  // 140 hand cannon: 70 crit / 47 body — 3 crits + 1 body since Edge of Fate
  const hc140 = { label: "", critDamage: 70, bodyDamage: 47, rpm: 140 };

  it("140 hand cannon kills in 4 optimal shots at 1.29s", () => {
    const r = computeTtk(hc140, CRUCIBLE_HP)!;
    expect(r.optimalShots).toBe(4); // 3 × 70 = 210 < 230
    expect(r.optimalTtk).toBeCloseTo(3 * (60 / 140), 2); // ≈ 1.29s
    expect(r.allowedBodyShots).toBe(2); // 2 crit + 2 body = 234 ≥ 230 still kills
  });

  it("120 hand cannon lost its 2-crit-1-body kill in Monument of Triumph", () => {
    // post-9.7.0 values: 2×90.1 + 48.7 = 228.9 < 230
    const after = computeTtk({ label: "", critDamage: 90.1, bodyDamage: 48.7, rpm: 120 }, CRUCIBLE_HP)!;
    expect(after.optimalShots).toBe(3);
    expect(after.allowedBodyShots).toBe(0);
    // pre-9.7.0 values: 2×90.65 + 49 = 230.3 ≥ 230 → forgiveness existed
    const before = computeTtk({ label: "", critDamage: 90.65, bodyDamage: 49, rpm: 120 }, CRUCIBLE_HP)!;
    expect(before.allowedBodyShots).toBe(1);
  });

  it("900 SMG needs 11 crits + 1 body at base Weapons stat", () => {
    const smg = findArchetype("Submachine Gun", 900)!;
    const r = computeTtk(smg, CRUCIBLE_HP)!;
    expect(r.optimalShots).toBe(12); // 11h1b breakpoint data
    expect(r.optimalTtk).toBeCloseTo(11 * (60 / 900), 2); // ≈ 0.73s
  });

  it("150 scout three-taps at 0.80s", () => {
    const scout = findArchetype("Scout Rifle", 150)!;
    const r = computeTtk(scout, CRUCIBLE_HP)!;
    expect(r.optimalShots).toBe(3);
    expect(r.optimalTtk).toBeCloseTo(0.8, 2);
  });
});

describe("Weapons stat breakpoints", () => {
  it("900 SMG drops a shot at high Weapons stat (11h1b → 11h0b)", () => {
    const smg = findArchetype("Submachine Gun", 900)!;
    expect(computeTtkAtWeaponsStat(smg, CRUCIBLE_HP, 100)!.optimalShots).toBe(12);
    expect(computeTtkAtWeaponsStat(smg, CRUCIBLE_HP, 190)!.optimalShots).toBe(11);
  });

  it("no-crit weapons still benefit from the multiplier", () => {
    const fusion = { label: "", critDamage: 46, bodyDamage: 46, rpm: 600, noCrit: true };
    expect(computeTtkAtWeaponsStat(fusion, CRUCIBLE_HP, 100)!.optimalShots).toBe(5);
    expect(computeTtkAtWeaponsStat(fusion, CRUCIBLE_HP, 100)!.allowedBodyShots).toBe(0);
  });

  it("rejects nonsense input", () => {
    expect(computeTtk({ label: "", critDamage: 0, bodyDamage: 10, rpm: 100 }, 230)).toBeNull();
    expect(computeTtk({ label: "", critDamage: 70, bodyDamage: 47, rpm: 140 }, 0)).toBeNull();
  });
});
