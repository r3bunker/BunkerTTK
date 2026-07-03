// Time-to-kill math for Crucible (PvP).
//
// Sandbox model (current as of Monument of Triumph, Update 9.7.0, June 2026 —
// the final balance patch, so these rules are permanent):
//
//  - Every Guardian has a flat 230 HP in the Crucible (since The Edge of
//    Fate). The Armor 3.0 "Health" stat no longer changes your HP pool in
//    PvP — it only shortens the delay before health regen starts.
//  - The "Weapons" stat scales weapon damage against Guardians: each point
//    above 100 adds +0.05% damage, up to +5% at 200. This is what shifts
//    shots-to-kill breakpoints now (the role resilience tiers used to play).
//
// Per-shot damage is NOT in the Bungie manifest — like d2foundry, we keep a
// community-maintained table of damage values per archetype (weapon type +
// RPM). Values below are calibrated against known post-Edge-of-Fate
// shots-to-kill breakpoints and the Monument of Triumph tuning pass, but
// they remain approximations — the UI lets you edit them.

export const CRUCIBLE_HP = 230;

/** Weapons-stat rows shown in the TTK table. */
export const WEAPONS_STAT_ROWS = [100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];

/** PvP damage multiplier from the Weapons stat: +0.05% per point above 100. */
export function weaponsStatMultiplier(weaponsStat: number): number {
  const clamped = Math.max(0, Math.min(200, weaponsStat));
  return 1 + Math.max(0, clamped - 100) * 0.0005;
}

export interface DamageProfile {
  /** archetype label, e.g. "Adaptive (140 RPM)" */
  label: string;
  critDamage: number;
  bodyDamage: number;
  /** rounds per minute used for TTK math (bullet cadence for bursts) */
  rpm: number;
  /** true when the weapon can't crit (fusions, most explosives) */
  noCrit?: boolean;
}

export interface ArchetypeEntry extends DamageProfile {
  weaponType: string;
  /** RPM value as it appears in the weapon's stats, used for matching */
  statRpm: number;
}

// Approximate damage values for the Monument of Triumph (9.7.0) sandbox,
// per bullet, before any Weapons-stat bonus. Editable in the UI.
export const DAMAGE_TABLE: ArchetypeEntry[] = [
  // Hand cannons — 120s nerfed in 9.7.0 (90.65→90.1 crit, 49→48.7 body),
  // which broke their 2-crit-1-body kill; 180s hit hard post-Edge-of-Fate.
  { weaponType: "Hand Cannon", statRpm: 140, label: "Adaptive (140)", critDamage: 70, bodyDamage: 47, rpm: 140 },
  { weaponType: "Hand Cannon", statRpm: 120, label: "Aggressive (120)", critDamage: 90.1, bodyDamage: 48.7, rpm: 120 },
  { weaponType: "Hand Cannon", statRpm: 180, label: "Precision (180)", critDamage: 75, bodyDamage: 41, rpm: 180 },
  { weaponType: "Auto Rifle", statRpm: 720, label: "Rapid-Fire (720)", critDamage: 23, bodyDamage: 14.5, rpm: 720 },
  { weaponType: "Auto Rifle", statRpm: 600, label: "Adaptive (600)", critDamage: 31, bodyDamage: 19, rpm: 600 },
  { weaponType: "Auto Rifle", statRpm: 450, label: "Precision (450)", critDamage: 36, bodyDamage: 22.5, rpm: 450 },
  { weaponType: "Auto Rifle", statRpm: 400, label: "High-Impact (400)", critDamage: 43, bodyDamage: 27, rpm: 400 },
  { weaponType: "Auto Rifle", statRpm: 360, label: "High-Impact (360)", critDamage: 43, bodyDamage: 27, rpm: 360 },
  // Pulses — Lightweight 450s nerfed in 9.7.0.
  { weaponType: "Pulse Rifle", statRpm: 540, label: "Rapid-Fire (540)", critDamage: 28, bodyDamage: 18, rpm: 540 },
  { weaponType: "Pulse Rifle", statRpm: 450, label: "Lightweight (450)", critDamage: 31.2, bodyDamage: 20.1, rpm: 450 },
  { weaponType: "Pulse Rifle", statRpm: 390, label: "Adaptive (390)", critDamage: 32.5, bodyDamage: 20.4, rpm: 390 },
  { weaponType: "Pulse Rifle", statRpm: 340, label: "High-Impact (340)", critDamage: 33, bodyDamage: 21, rpm: 340 },
  { weaponType: "Submachine Gun", statRpm: 900, label: "Lightweight (900)", critDamage: 20.2, bodyDamage: 12.7, rpm: 900 },
  { weaponType: "Submachine Gun", statRpm: 750, label: "Adaptive (750)", critDamage: 22, bodyDamage: 14, rpm: 750 },
  { weaponType: "Submachine Gun", statRpm: 600, label: "Precision (600)", critDamage: 25, bodyDamage: 16, rpm: 600 },
  // Scouts — Rapid-Fire 260s nerfed in 9.7.0; 150s three-tap at 0.80s.
  { weaponType: "Scout Rifle", statRpm: 260, label: "Rapid-Fire (260)", critDamage: 52, bodyDamage: 32.5, rpm: 260 },
  { weaponType: "Scout Rifle", statRpm: 200, label: "Lightweight (200)", critDamage: 55, bodyDamage: 34.5, rpm: 200 },
  { weaponType: "Scout Rifle", statRpm: 180, label: "Precision (180)", critDamage: 64, bodyDamage: 40, rpm: 180 },
  { weaponType: "Scout Rifle", statRpm: 150, label: "High-Impact (150)", critDamage: 78, bodyDamage: 42, rpm: 150 },
  { weaponType: "Sidearm", statRpm: 491, label: "Adaptive Burst (491)", critDamage: 37.5, bodyDamage: 25, rpm: 491 },
  { weaponType: "Sidearm", statRpm: 450, label: "Adaptive (450)", critDamage: 42, bodyDamage: 28, rpm: 450 },
  { weaponType: "Sidearm", statRpm: 360, label: "Lightweight (360)", critDamage: 51, bodyDamage: 34, rpm: 360 },
  { weaponType: "Sidearm", statRpm: 325, label: "Precision (325)", critDamage: 50, bodyDamage: 33, rpm: 325 },
  { weaponType: "Sidearm", statRpm: 300, label: "Aggressive Burst (300)", critDamage: 53, bodyDamage: 35, rpm: 300 },
  { weaponType: "Combat Bow", statRpm: 0, label: "Precision", critDamage: 160, bodyDamage: 94, rpm: 55 },
  { weaponType: "Trace Rifle", statRpm: 1000, label: "Adaptive (1000)", critDamage: 18.5, bodyDamage: 12, rpm: 1000 },
  { weaponType: "Sniper Rifle", statRpm: 140, label: "Rapid-Fire (140)", critDamage: 265, bodyDamage: 85, rpm: 140 },
  { weaponType: "Sniper Rifle", statRpm: 90, label: "Adaptive (90)", critDamage: 290, bodyDamage: 95, rpm: 90 },
  { weaponType: "Sniper Rifle", statRpm: 72, label: "Aggressive (72)", critDamage: 320, bodyDamage: 105, rpm: 72 },
  { weaponType: "Shotgun", statRpm: 140, label: "Rapid-Fire pellet (140)", critDamage: 195, bodyDamage: 165, rpm: 140 },
  { weaponType: "Shotgun", statRpm: 80, label: "Aggressive pellet (80)", critDamage: 220, bodyDamage: 185, rpm: 80 },
  { weaponType: "Shotgun", statRpm: 65, label: "Precision slug (65)", critDamage: 250, bodyDamage: 140, rpm: 65 },
  { weaponType: "Fusion Rifle", statRpm: 0, label: "Adaptive (per bolt ×7)", critDamage: 46, bodyDamage: 46, rpm: 600, noCrit: true },
  { weaponType: "Linear Fusion Rifle", statRpm: 0, label: "Precision", critDamage: 300, bodyDamage: 170, rpm: 60 },
  { weaponType: "Machine Gun", statRpm: 900, label: "Rapid-Fire (900)", critDamage: 17.5, bodyDamage: 11.5, rpm: 900 },
  { weaponType: "Machine Gun", statRpm: 600, label: "Adaptive (600)", critDamage: 26, bodyDamage: 17, rpm: 600 },
  { weaponType: "Machine Gun", statRpm: 450, label: "High-Impact (450)", critDamage: 35.5, bodyDamage: 23.5, rpm: 450 },
  { weaponType: "Grenade Launcher", statRpm: 0, label: "Direct hit", critDamage: 180, bodyDamage: 180, rpm: 90, noCrit: true },
  { weaponType: "Rocket Launcher", statRpm: 0, label: "Direct hit", critDamage: 380, bodyDamage: 380, rpm: 20, noCrit: true },
  { weaponType: "Glaive", statRpm: 0, label: "Projectile", critDamage: 100, bodyDamage: 100, rpm: 55, noCrit: true },
];

/** Find the best damage-table match for a weapon type + RPM stat. */
export function findArchetype(
  weaponType: string,
  rpmStat: number | undefined,
): ArchetypeEntry | undefined {
  const ofType = DAMAGE_TABLE.filter((e) => e.weaponType === weaponType);
  if (ofType.length === 0) return undefined;
  if (rpmStat === undefined) return ofType[0];
  let best = ofType[0];
  let bestDist = Math.abs(best.statRpm - rpmStat);
  for (const e of ofType) {
    const d = Math.abs(e.statRpm - rpmStat);
    if (d < bestDist) {
      best = e;
      bestDist = d;
    }
  }
  return best;
}

export interface TtkResult {
  /** shots needed if every shot crits */
  optimalShots: number;
  /** seconds, first shot at t=0 */
  optimalTtk: number;
  /** shots needed with body shots only */
  bodyShots: number;
  bodyTtk: number;
  /** body shots you can eat while keeping the optimal shot count (forgiveness) */
  allowedBodyShots: number;
}

export function computeTtk(profile: DamageProfile, hp: number): TtkResult | null {
  const { critDamage, bodyDamage, rpm } = profile;
  if (critDamage <= 0 || bodyDamage <= 0 || rpm <= 0 || hp <= 0) return null;

  const crit = profile.noCrit ? bodyDamage : critDamage;
  const optimalShots = Math.ceil(hp / crit);
  const bodyShots = Math.ceil(hp / bodyDamage);
  const secondsPerShot = 60 / rpm;

  let allowedBodyShots = 0;
  if (!profile.noCrit) {
    for (let m = 0; m <= optimalShots; m++) {
      if ((optimalShots - m) * crit + m * bodyDamage >= hp) allowedBodyShots = m;
      else break;
    }
  }

  return {
    optimalShots,
    optimalTtk: (optimalShots - 1) * secondsPerShot,
    bodyShots,
    bodyTtk: (bodyShots - 1) * secondsPerShot,
    allowedBodyShots,
  };
}

/** TTK with the Weapons-stat damage bonus applied. */
export function computeTtkAtWeaponsStat(
  profile: DamageProfile,
  hp: number,
  weaponsStat: number,
): TtkResult | null {
  const mult = weaponsStatMultiplier(weaponsStat);
  return computeTtk(
    { ...profile, critDamage: profile.critDamage * mult, bodyDamage: profile.bodyDamage * mult },
    hp,
  );
}
