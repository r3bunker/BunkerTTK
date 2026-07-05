// Stat math: combines a weapon's investment stats with selected perks and
// masterwork, then converts investment values to display values using the
// stat group's interpolation table (same algorithm Bungie/DIM use).

import { STAT, type ManifestBundle, type PerkDef, type WeaponDef } from "../types.ts";

/** Bankers' rounding (round half to even), matching Bungie's in-game display. */
export function roundHalfToEven(value: number): number {
  const floor = Math.floor(value);
  const diff = value - floor;
  if (diff > 0.5) return floor + 1;
  if (diff < 0.5) return floor;
  return floor % 2 === 0 ? floor : floor + 1;
}

/** Linearly interpolate an investment value through a stat-group curve. */
export function interpolateStat(
  investment: number,
  points: { value: number; weight: number }[],
): number {
  if (points.length === 0) return investment;
  if (points.length === 1) return points[0].weight;

  const sorted = [...points].sort((a, b) => a.value - b.value);
  const clamped = Math.max(sorted[0].value, Math.min(investment, sorted[sorted.length - 1].value));

  for (let i = 1; i < sorted.length; i++) {
    const lo = sorted[i - 1];
    const hi = sorted[i];
    if (clamped <= hi.value) {
      if (hi.value === lo.value) return hi.weight;
      const t = (clamped - lo.value) / (hi.value - lo.value);
      return roundHalfToEven(lo.weight + t * (hi.weight - lo.weight));
    }
  }
  return sorted[sorted.length - 1].weight;
}

export interface ComputedStat {
  statHash: number;
  name: string;
  /** investment total (base + perks + masterwork) */
  investment: number;
  /** displayed value after stat-group interpolation */
  display: number;
  /** display value with no perks/masterwork, for showing deltas */
  baseDisplay: number;
  /** bar maximum (from stat group scaledStats, default 100) */
  max: number;
  /** true for stats shown as a bar (vs. plain number like RPM / recoil) */
  bar: boolean;
}

// Stats shown as plain numbers rather than bars.
const NUMERIC_STATS = new Set<number>([
  STAT.RPM,
  STAT.MAGAZINE,
  STAT.RECOIL_DIR,
  STAT.ZOOM,
  STAT.CHARGE_TIME,
  STAT.DRAW_TIME,
]);

// Display order roughly matching the in-game inspector.
const STAT_ORDER: number[] = [
  STAT.IMPACT,
  STAT.BLAST_RADIUS,
  STAT.VELOCITY,
  STAT.RANGE,
  STAT.ACCURACY,
  STAT.SHIELD_DURATION,
  STAT.STABILITY,
  STAT.HANDLING,
  STAT.RELOAD,
  STAT.AIM_ASSIST,
  STAT.AIRBORNE,
  STAT.ZOOM,
  STAT.RECOIL_DIR,
  STAT.RPM,
  STAT.CHARGE_TIME,
  STAT.DRAW_TIME,
  STAT.MAGAZINE,
];

function statSortKey(hash: number): number {
  const i = STAT_ORDER.indexOf(hash);
  return i === -1 ? 999 : i;
}

export interface StatModifiers {
  perks: PerkDef[];
  /** stat hash boosted by the (synthesized, tier-10) masterwork, or null */
  masterworkStat: number | null;
  /** include conditionally-active perk stats (e.g. Keep Away's bonus) */
  includeConditional: boolean;
}

export function computeStats(
  weapon: WeaponDef,
  bundle: ManifestBundle,
  mods: StatModifiers,
): ComputedStat[] {
  const group = weapon.statGroupHash ? bundle.statGroups[weapon.statGroupHash] : undefined;
  const scaledByHash = new Map(group?.scaledStats.map((s) => [s.statHash, s]) ?? []);

  const base = new Map<number, number>();
  for (const s of weapon.investmentStats) base.set(s.statHash, s.value);

  const modified = new Map(base);
  const bump = (statHash: number, delta: number) => {
    modified.set(statHash, (modified.get(statHash) ?? 0) + delta);
  };

  for (const perk of mods.perks) {
    for (const s of perk.investmentStats) {
      if (s.isConditionallyActive && !mods.includeConditional) continue;
      bump(s.statHash, s.value);
    }
  }
  if (mods.masterworkStat !== null) bump(mods.masterworkStat, 10);

  const result: ComputedStat[] = [];
  for (const [statHash, investment] of modified) {
    const statDef = bundle.stats[statHash];
    if (!statDef) continue;
    const scaled = scaledByHash.get(statHash);
    // Only show stats the stat group knows how to display, plus a few
    // well-known numeric stats that some groups leave unscaled.
    if (!scaled && !NUMERIC_STATS.has(statHash)) continue;

    const display = scaled
      ? interpolateStat(investment, scaled.displayInterpolation)
      : investment;
    const baseInv = base.get(statHash) ?? 0;
    const baseDisplay = scaled
      ? interpolateStat(baseInv, scaled.displayInterpolation)
      : baseInv;

    result.push({
      statHash,
      name: statDef.name,
      investment,
      display,
      baseDisplay,
      max: scaled?.maximumValue ?? 100,
      bar: !NUMERIC_STATS.has(statHash),
    });
  }

  result.sort((a, b) => statSortKey(a.statHash) - statSortKey(b.statHash));
  return result;
}

/** Masterwork stat options synthesized per weapon type (tier-10 = +10 investment). */
export function masterworkOptions(weapon: WeaponDef): number[] {
  const has = (h: number) => weapon.investmentStats.some((s) => s.statHash === h);
  const candidates = [
    STAT.RANGE,
    STAT.STABILITY,
    STAT.HANDLING,
    STAT.RELOAD,
    STAT.CHARGE_TIME,
    STAT.DRAW_TIME,
    STAT.ACCURACY,
    STAT.BLAST_RADIUS,
    STAT.VELOCITY,
    STAT.SHIELD_DURATION,
  ];
  return candidates.filter(has);
}
