import { describe, expect, it } from "vitest";
import { computeTtk, findArchetype } from "./ttk.ts";

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

describe("computeTtk", () => {
  // 140 hand cannon: 70 crit / 44 body
  const hc140 = { label: "", critDamage: 70, bodyDamage: 44, rpm: 140 };

  it("computes optimal shots and TTK", () => {
    const r = computeTtk(hc140, 200)!;
    expect(r.optimalShots).toBe(3); // 3 × 70 = 210 ≥ 200
    expect(r.optimalTtk).toBeCloseTo((3 - 1) * (60 / 140), 5); // ≈ 0.857s
  });

  it("computes body shots", () => {
    const r = computeTtk(hc140, 200)!;
    expect(r.bodyShots).toBe(5); // 5 × 44 = 220 ≥ 200
    expect(r.bodyTtk).toBeCloseTo(4 * (60 / 140), 5);
  });

  it("computes forgiveness (body shots allowed in optimal count)", () => {
    // 3 shots: 2 crit + 1 body = 184 < 200, so zero forgiveness
    expect(computeTtk(hc140, 200)!.allowedBodyShots).toBe(0);
    // vs 180 HP: 2 crit + 1 body = 184 ≥ 180 → 1 forgivable body shot
    expect(computeTtk(hc140, 180)!.allowedBodyShots).toBe(1);
  });

  it("treats no-crit weapons as body-only", () => {
    const fusion = { label: "", critDamage: 40, bodyDamage: 40, rpm: 600, noCrit: true };
    const r = computeTtk(fusion, 200)!;
    expect(r.optimalShots).toBe(5);
    expect(r.allowedBodyShots).toBe(0);
  });

  it("rejects nonsense input", () => {
    expect(computeTtk({ label: "", critDamage: 0, bodyDamage: 10, rpm: 100 }, 200)).toBeNull();
    expect(computeTtk(hc140, 0)).toBeNull();
  });
});
