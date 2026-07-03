// Time-to-kill math for Crucible (PvP).
//
// Per-shot damage is NOT in the Bungie manifest — like d2foundry, we keep a
// community-maintained table of damage values per archetype (weapon type +
// RPM). Values drift with sandbox patches, so the UI lets you edit them.

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

// Approximate current-sandbox damage values. Editable in the UI.
export const DAMAGE_TABLE: ArchetypeEntry[] = [
  { weaponType: "Hand Cannon", statRpm: 140, label: "Adaptive (140)", critDamage: 70, bodyDamage: 44, rpm: 140 },
  { weaponType: "Hand Cannon", statRpm: 120, label: "Aggressive (120)", critDamage: 87, bodyDamage: 52, rpm: 120 },
  { weaponType: "Hand Cannon", statRpm: 180, label: "Lightweight (180)", critDamage: 56, bodyDamage: 37, rpm: 180 },
  { weaponType: "Auto Rifle", statRpm: 720, label: "Rapid-Fire (720)", critDamage: 22, bodyDamage: 14, rpm: 720 },
  { weaponType: "Auto Rifle", statRpm: 600, label: "Adaptive (600)", critDamage: 30, bodyDamage: 18, rpm: 600 },
  { weaponType: "Auto Rifle", statRpm: 450, label: "Precision (450)", critDamage: 35, bodyDamage: 22, rpm: 450 },
  { weaponType: "Auto Rifle", statRpm: 360, label: "High-Impact (360)", critDamage: 42, bodyDamage: 26, rpm: 360 },
  { weaponType: "Pulse Rifle", statRpm: 540, label: "Rapid-Fire (540)", critDamage: 20, bodyDamage: 13, rpm: 540 },
  { weaponType: "Pulse Rifle", statRpm: 450, label: "Adaptive (450)", critDamage: 24, bodyDamage: 15, rpm: 450 },
  { weaponType: "Pulse Rifle", statRpm: 390, label: "Lightweight (390)", critDamage: 27, bodyDamage: 17, rpm: 390 },
  { weaponType: "Pulse Rifle", statRpm: 340, label: "High-Impact (340)", critDamage: 30, bodyDamage: 19, rpm: 340 },
  { weaponType: "Submachine Gun", statRpm: 900, label: "Lightweight (900)", critDamage: 16, bodyDamage: 10, rpm: 900 },
  { weaponType: "Submachine Gun", statRpm: 750, label: "Adaptive (750)", critDamage: 20, bodyDamage: 13, rpm: 750 },
  { weaponType: "Submachine Gun", statRpm: 600, label: "Precision (600)", critDamage: 23, bodyDamage: 15, rpm: 600 },
  { weaponType: "Scout Rifle", statRpm: 260, label: "Rapid-Fire (260)", critDamage: 42, bodyDamage: 26, rpm: 260 },
  { weaponType: "Scout Rifle", statRpm: 200, label: "Lightweight (200)", critDamage: 52, bodyDamage: 33, rpm: 200 },
  { weaponType: "Scout Rifle", statRpm: 180, label: "Precision (180)", critDamage: 60, bodyDamage: 37, rpm: 180 },
  { weaponType: "Scout Rifle", statRpm: 150, label: "High-Impact (150)", critDamage: 70, bodyDamage: 44, rpm: 150 },
  { weaponType: "Sidearm", statRpm: 450, label: "Adaptive Burst (450)", critDamage: 28, bodyDamage: 19, rpm: 450 },
  { weaponType: "Sidearm", statRpm: 360, label: "Adaptive (360)", critDamage: 30, bodyDamage: 20, rpm: 360 },
  { weaponType: "Sidearm", statRpm: 325, label: "Precision (325)", critDamage: 33, bodyDamage: 22, rpm: 325 },
  { weaponType: "Sidearm", statRpm: 300, label: "Aggressive Burst (300)", critDamage: 35, bodyDamage: 23, rpm: 300 },
  { weaponType: "Combat Bow", statRpm: 0, label: "Precision", critDamage: 155, bodyDamage: 91, rpm: 55 },
  { weaponType: "Trace Rifle", statRpm: 1000, label: "Adaptive (1000)", critDamage: 17, bodyDamage: 11, rpm: 1000 },
  { weaponType: "Sniper Rifle", statRpm: 140, label: "Rapid-Fire (140)", critDamage: 250, bodyDamage: 80, rpm: 140 },
  { weaponType: "Sniper Rifle", statRpm: 90, label: "Adaptive (90)", critDamage: 270, bodyDamage: 90, rpm: 90 },
  { weaponType: "Sniper Rifle", statRpm: 72, label: "Aggressive (72)", critDamage: 300, bodyDamage: 100, rpm: 72 },
  { weaponType: "Shotgun", statRpm: 140, label: "Rapid-Fire pellet (140)", critDamage: 180, bodyDamage: 155, rpm: 140 },
  { weaponType: "Shotgun", statRpm: 80, label: "Aggressive pellet (80)", critDamage: 210, bodyDamage: 180, rpm: 80 },
  { weaponType: "Shotgun", statRpm: 65, label: "Precision slug (65)", critDamage: 234, bodyDamage: 130, rpm: 65 },
  { weaponType: "Fusion Rifle", statRpm: 0, label: "Adaptive (per bolt ×7)", critDamage: 40, bodyDamage: 40, rpm: 600, noCrit: true },
  { weaponType: "Linear Fusion Rifle", statRpm: 0, label: "Precision", critDamage: 290, bodyDamage: 165, rpm: 60 },
  { weaponType: "Machine Gun", statRpm: 900, label: "Rapid-Fire (900)", critDamage: 16, bodyDamage: 11, rpm: 900 },
  { weaponType: "Machine Gun", statRpm: 600, label: "Adaptive (600)", critDamage: 24, bodyDamage: 16, rpm: 600 },
  { weaponType: "Machine Gun", statRpm: 450, label: "High-Impact (450)", critDamage: 33, bodyDamage: 22, rpm: 450 },
  { weaponType: "Grenade Launcher", statRpm: 0, label: "Direct hit", critDamage: 165, bodyDamage: 165, rpm: 90, noCrit: true },
  { weaponType: "Rocket Launcher", statRpm: 0, label: "Direct hit", critDamage: 350, bodyDamage: 350, rpm: 20, noCrit: true },
  { weaponType: "Glaive", statRpm: 0, label: "Projectile", critDamage: 92, bodyDamage: 92, rpm: 55, noCrit: true },
];

/**
 * Total player HP (health + shields) per resilience tier 0-10.
 * Approximate; editable in the UI.
 */
export const DEFAULT_RESILIENCE_HP: number[] = [
  185, 186.5, 188, 189.5, 191, 192.5, 194, 195.5, 197, 198.5, 200,
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
