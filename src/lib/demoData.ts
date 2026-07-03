// Bundled sample dataset so the app works with no API key / offline.
// Weapon names are invented; archetypes, stats, and perks mirror real ones.

import {
  STAT,
  type ManifestBundle,
  type PerkDef,
  type StatValue,
  type WeaponDef,
} from "../types.ts";

const DEMO_STAT_GROUP = 1000;

function perk(
  hash: number,
  name: string,
  itemTypeDisplayName: string,
  description: string,
  stats: [number, number, boolean?][] = [],
  plugCategory = "traits",
): PerkDef {
  return {
    hash,
    name,
    description,
    icon: null,
    itemTypeDisplayName,
    plugCategory,
    investmentStats: stats.map(([statHash, value, cond]) => ({
      statHash,
      value,
      isConditionallyActive: cond ?? false,
    })),
  };
}

const PERKS: PerkDef[] = [
  // intrinsics
  perk(9001, "Adaptive Frame", "Intrinsic", "A well-rounded grip, reliable and sturdy.", [], "intrinsics"),
  perk(9002, "Aggressive Frame", "Intrinsic", "High damage, high recoil.", [], "intrinsics"),
  perk(9003, "Lightweight Frame", "Intrinsic", "Superb handling. Move faster with this weapon equipped.", [], "intrinsics"),
  perk(9004, "Precision Frame", "Intrinsic", "Fires a steady, predictable recoil pattern.", [], "intrinsics"),
  perk(9005, "Rapid-Fire Frame", "Intrinsic", "Deeper ammo reserves. Slightly faster reload when magazine is empty.", [], "intrinsics"),
  perk(9006, "High-Impact Frame", "Intrinsic", "Slow firing and high damage.", [], "intrinsics"),
  // barrels
  perk(9101, "Full Bore", "Barrel", "Barrel optimized for distance.", [[STAT.RANGE, 15], [STAT.STABILITY, -10], [STAT.HANDLING, -5]], "barrels"),
  perk(9102, "Hammer-Forged Rifling", "Barrel", "Durable ranged barrel.", [[STAT.RANGE, 10]], "barrels"),
  perk(9103, "Smallbore", "Barrel", "Dual strength barrel.", [[STAT.RANGE, 7], [STAT.STABILITY, 7]], "barrels"),
  perk(9104, "Corkscrew Rifling", "Barrel", "Balanced barrel.", [[STAT.RANGE, 5], [STAT.STABILITY, 5], [STAT.HANDLING, 5]], "barrels"),
  perk(9105, "Fluted Barrel", "Barrel", "Ultra-light barrel.", [[STAT.HANDLING, 15], [STAT.STABILITY, 5]], "barrels"),
  perk(9106, "Arrowhead Brake", "Barrel", "Lightly vented barrel.", [[STAT.RECOIL_DIR, 30], [STAT.HANDLING, 10]], "barrels"),
  // magazines
  perk(9201, "Accurized Rounds", "Magazine", "This weapon can fire longer distances.", [[STAT.RANGE, 10]], "magazines"),
  perk(9202, "Tactical Mag", "Magazine", "This weapon has multiple tactical improvements.", [[STAT.STABILITY, 5], [STAT.RELOAD, 10], [STAT.MAGAZINE, 1]], "magazines"),
  perk(9203, "Extended Mag", "Magazine", "This weapon has a greatly increased magazine size, but reloads much slower.", [[STAT.MAGAZINE, 3], [STAT.RELOAD, -20]], "magazines"),
  perk(9204, "Flared Magwell", "Magazine", "Optimized for fast reloading.", [[STAT.RELOAD, 15], [STAT.STABILITY, 5]], "magazines"),
  perk(9205, "Ricochet Rounds", "Magazine", "Rounds ricochet off hard surfaces.", [[STAT.STABILITY, 10], [STAT.RANGE, 5]], "magazines"),
  perk(9206, "Steady Rounds", "Magazine", "This magazine is optimized for recoil control.", [[STAT.STABILITY, 15], [STAT.RANGE, -5]], "magazines"),
  // traits
  perk(9301, "Outlaw", "Trait", "Precision kills greatly decrease reload time."),
  perk(9302, "Rampage", "Trait", "Kills with this weapon temporarily grant increased damage. Stacks 3x."),
  perk(9303, "Kill Clip", "Trait", "Reloading after a kill grants increased damage."),
  perk(9304, "Zen Moment", "Trait", "Causing damage with this weapon increases its stability and reduces flinch."),
  perk(9305, "Moving Target", "Trait", "Increased movement speed and target acquisition when moving while aiming down sights.", [[STAT.AIM_ASSIST, 10]]),
  perk(9306, "Snapshot Sights", "Trait", "Faster time to aim down sights."),
  perk(9307, "Opening Shot", "Trait", "Improved accuracy and range on the opening shot of attack.", [[STAT.RANGE, 4, true], [STAT.AIM_ASSIST, 15, true]]),
  perk(9308, "Eye of the Storm", "Trait", "This weapon becomes more accurate and boasts improved handling as your health gets lower.", [[STAT.HANDLING, 15, true]]),
  perk(9309, "Perpetual Motion", "Trait", "This weapon gains bonus stability, handling, and reload speed while the wielder is in motion.", [[STAT.STABILITY, 10, true], [STAT.HANDLING, 10, true], [STAT.RELOAD, 10, true]]),
  perk(9310, "Keep Away", "Trait", "Improved reload, range, and accuracy when no combatants are in close proximity.", [[STAT.RANGE, 10, true], [STAT.RELOAD, 30, true]]),
  perk(9311, "Adrenaline Junkie", "Trait", "This weapon gains increased damage and handling from grenade kills and kills with this weapon."),
  perk(9312, "Frenzy", "Trait", "Being in combat for an extended time increases damage, handling, and reload for this weapon.", [[STAT.HANDLING, 50, true], [STAT.RELOAD, 50, true]]),
  perk(9313, "Rangefinder", "Trait", "Aiming this weapon increases its effective range."),
  perk(9314, "Slideways", "Trait", "Sliding partially reloads this weapon's magazine and temporarily boosts handling and stability.", [[STAT.HANDLING, 20, true], [STAT.STABILITY, 20, true]]),
  perk(9315, "Vorpal Weapon", "Trait", "Increased damage against bosses, vehicles, and Guardians with their Super active."),
  perk(9316, "Quickdraw", "Trait", "This weapon can be drawn unbelievably fast.", [[STAT.HANDLING, 100, true]]),
  // origin traits
  perk(9401, "Alacrity", "Origin Trait", "Gain increased reload, stability, aim assist, and range when you are the last living member of your fireteam.", [[STAT.RANGE, 20, true], [STAT.STABILITY, 20, true], [STAT.RELOAD, 50, true], [STAT.AIM_ASSIST, 10, true]], "origins"),
  perk(9402, "Bunker Doctrine", "Origin Trait", "Dealing sustained damage grants a stacking bonus to this weapon's stability and range.", [[STAT.RANGE, 10, true], [STAT.STABILITY, 10, true]], "origins"),
];

interface DemoWeaponSpec {
  hash: number;
  name: string;
  flavor: string;
  type: string;
  slot: WeaponDef["weaponSlot"];
  ammo: number;
  damage: number;
  tier?: [number, string];
  intrinsic: number;
  stats: [number, number][];
  columns: number[][];
  craftable?: boolean;
}

function weapon(spec: DemoWeaponSpec): WeaponDef {
  const stats: StatValue[] = spec.stats.map(([statHash, value]) => ({ statHash, value }));
  return {
    hash: spec.hash,
    name: spec.name,
    flavorText: spec.flavor,
    icon: null,
    watermark: null,
    screenshot: null,
    tierType: spec.tier?.[0] ?? 5,
    tierTypeName: spec.tier?.[1] ?? "Legendary",
    itemTypeDisplayName: spec.type,
    weaponSlot: spec.slot,
    ammoType: spec.ammo,
    damageType: spec.damage,
    intrinsicHash: spec.intrinsic,
    statGroupHash: DEMO_STAT_GROUP,
    investmentStats: stats,
    perkColumns: spec.columns.map((plugHashes, i) => ({
      socketIndex: i + 1,
      plugHashes,
      initialPlugHash: null,
      randomized: true,
    })),
    craftable: spec.craftable ?? false,
  };
}

const BARRELS = [9101, 9102, 9103, 9104, 9105, 9106];
const MAGS = [9201, 9202, 9203, 9204, 9205, 9206];

const WEAPONS: WeaponDef[] = [
  weapon({
    hash: 1001, name: "Last Transmission", type: "Hand Cannon", slot: "kinetic", ammo: 1, damage: 1,
    flavor: '"Keep sending until someone answers." —Bunker log, day 112',
    intrinsic: 9001, craftable: true,
    stats: [[STAT.IMPACT, 84], [STAT.RANGE, 52], [STAT.STABILITY, 48], [STAT.HANDLING, 55], [STAT.RELOAD, 50], [STAT.AIM_ASSIST, 68], [STAT.ZOOM, 14], [STAT.AIRBORNE, 22], [STAT.RECOIL_DIR, 94], [STAT.RPM, 140], [STAT.MAGAZINE, 11]],
    columns: [BARRELS, MAGS, [9301, 9304, 9308, 9309, 9316], [9302, 9303, 9307, 9310, 9315], [9402]],
  }),
  weapon({
    hash: 1002, name: "Vault Warden", type: "Hand Cannon", slot: "energy", ammo: 1, damage: 3,
    flavor: "Twelve rounds of policy enforcement.",
    intrinsic: 9002,
    stats: [[STAT.IMPACT, 92], [STAT.RANGE, 60], [STAT.STABILITY, 42], [STAT.HANDLING, 38], [STAT.RELOAD, 42], [STAT.AIM_ASSIST, 60], [STAT.ZOOM, 14], [STAT.AIRBORNE, 15], [STAT.RECOIL_DIR, 91], [STAT.RPM, 120], [STAT.MAGAZINE, 9]],
    columns: [BARRELS, MAGS, [9304, 9306, 9308, 9314], [9302, 9303, 9313, 9315], [9401]],
  }),
  weapon({
    hash: 1003, name: "Static Hiss", type: "Submachine Gun", slot: "energy", ammo: 1, damage: 2,
    flavor: "You will hear it before you see it. You will feel it before you hear it.",
    intrinsic: 9003,
    stats: [[STAT.IMPACT, 15], [STAT.RANGE, 38], [STAT.STABILITY, 52], [STAT.HANDLING, 68], [STAT.RELOAD, 62], [STAT.AIM_ASSIST, 55], [STAT.ZOOM, 13], [STAT.AIRBORNE, 24], [STAT.RECOIL_DIR, 97], [STAT.RPM, 900], [STAT.MAGAZINE, 34]],
    columns: [BARRELS, MAGS, [9305, 9306, 9309, 9314], [9302, 9311, 9312, 9315], [9402]],
  }),
  weapon({
    hash: 1004, name: "Doctrine of Silence", type: "Submachine Gun", slot: "kinetic", ammo: 1, damage: 1,
    flavor: "Say nothing. Repeat as necessary.",
    intrinsic: 9001, craftable: true,
    stats: [[STAT.IMPACT, 22], [STAT.RANGE, 48], [STAT.STABILITY, 45], [STAT.HANDLING, 55], [STAT.RELOAD, 55], [STAT.AIM_ASSIST, 48], [STAT.ZOOM, 13], [STAT.AIRBORNE, 18], [STAT.RECOIL_DIR, 95], [STAT.RPM, 750], [STAT.MAGAZINE, 28]],
    columns: [BARRELS, MAGS, [9304, 9306, 9309, 9310], [9303, 9312, 9313, 9315], [9401]],
  }),
  weapon({
    hash: 1005, name: "Sixty Meters Down", type: "Pulse Rifle", slot: "kinetic", ammo: 1, damage: 7,
    flavor: "The surface is a rumor.",
    intrinsic: 9006,
    stats: [[STAT.IMPACT, 33], [STAT.RANGE, 62], [STAT.STABILITY, 50], [STAT.HANDLING, 40], [STAT.RELOAD, 48], [STAT.AIM_ASSIST, 45], [STAT.ZOOM, 17], [STAT.AIRBORNE, 12], [STAT.RECOIL_DIR, 68], [STAT.RPM, 340], [STAT.MAGAZINE, 30]],
    columns: [BARRELS, MAGS, [9301, 9305, 9307, 9310], [9303, 9313, 9315, 9316], [9402]],
  }),
  weapon({
    hash: 1006, name: "Perimeter Answer", type: "Auto Rifle", slot: "kinetic", ammo: 1, damage: 6,
    flavor: "Every question at the fence line gets the same reply.",
    intrinsic: 9005,
    stats: [[STAT.IMPACT, 18], [STAT.RANGE, 42], [STAT.STABILITY, 58], [STAT.HANDLING, 52], [STAT.RELOAD, 58], [STAT.AIM_ASSIST, 62], [STAT.ZOOM, 16], [STAT.AIRBORNE, 20], [STAT.RECOIL_DIR, 92], [STAT.RPM, 720], [STAT.MAGAZINE, 43]],
    columns: [BARRELS, MAGS, [9304, 9305, 9309, 9314], [9302, 9311, 9312, 9315], [9401]],
  }),
  weapon({
    hash: 1007, name: "Longwatch Litany", type: "Scout Rifle", slot: "energy", ammo: 1, damage: 3,
    flavor: "Recite the ranges. 300. 450. 600. Amen.",
    intrinsic: 9004, craftable: true,
    stats: [[STAT.IMPACT, 62], [STAT.RANGE, 68], [STAT.STABILITY, 45], [STAT.HANDLING, 44], [STAT.RELOAD, 52], [STAT.AIM_ASSIST, 65], [STAT.ZOOM, 20], [STAT.AIRBORNE, 14], [STAT.RECOIL_DIR, 72], [STAT.RPM, 180], [STAT.MAGAZINE, 16]],
    columns: [BARRELS, MAGS, [9301, 9306, 9308, 9310], [9302, 9307, 9313, 9315], [9402]],
  }),
  weapon({
    hash: 1008, name: "Cold Arithmetic", type: "Sniper Rifle", slot: "energy", ammo: 2, damage: 2,
    flavor: "One plus zero equals none.",
    intrinsic: 9001,
    stats: [[STAT.IMPACT, 70], [STAT.RANGE, 55], [STAT.STABILITY, 40], [STAT.HANDLING, 45], [STAT.RELOAD, 48], [STAT.AIM_ASSIST, 60], [STAT.ZOOM, 40], [STAT.AIRBORNE, 8], [STAT.RECOIL_DIR, 75], [STAT.RPM, 90], [STAT.MAGAZINE, 4]],
    columns: [BARRELS, MAGS, [9301, 9306, 9305], [9307, 9313, 9315, 9316], [9401]],
  }),
  weapon({
    hash: 1009, name: "Door Policy", type: "Shotgun", slot: "kinetic", ammo: 2, damage: 1,
    flavor: "No entry. No exceptions. No survivors of exceptions.",
    intrinsic: 9004,
    stats: [[STAT.IMPACT, 80], [STAT.RANGE, 65], [STAT.STABILITY, 55], [STAT.HANDLING, 50], [STAT.RELOAD, 45], [STAT.AIM_ASSIST, 45], [STAT.ZOOM, 12], [STAT.AIRBORNE, 10], [STAT.RECOIL_DIR, 70], [STAT.RPM, 65], [STAT.MAGAZINE, 5]],
    columns: [BARRELS, MAGS, [9306, 9314, 9316], [9307, 9313, 9315], [9402]],
  }),
  weapon({
    hash: 1010, name: "Failsafe Oath", type: "Fusion Rifle", slot: "energy", ammo: 2, damage: 4,
    flavor: "If all else fails, this won't.",
    intrinsic: 9001,
    stats: [[STAT.IMPACT, 70], [STAT.RANGE, 50], [STAT.STABILITY, 46], [STAT.HANDLING, 42], [STAT.RELOAD, 44], [STAT.AIM_ASSIST, 62], [STAT.ZOOM, 15], [STAT.AIRBORNE, 10], [STAT.RECOIL_DIR, 65], [STAT.CHARGE_TIME, 660], [STAT.MAGAZINE, 6]],
    columns: [BARRELS, MAGS, [9305, 9306, 9314], [9313, 9315, 9316], [9401]],
  }),
  weapon({
    hash: 1011, name: "Ceiling Collapse", type: "Rocket Launcher", slot: "power", ammo: 3, damage: 3,
    flavor: "Structural integrity is a shared resource.",
    intrinsic: 9002,
    stats: [[STAT.BLAST_RADIUS, 65], [STAT.VELOCITY, 52], [STAT.STABILITY, 55], [STAT.HANDLING, 48], [STAT.RELOAD, 50], [STAT.AIM_ASSIST, 60], [STAT.ZOOM, 20], [STAT.AIRBORNE, 12], [STAT.RECOIL_DIR, 70], [STAT.RPM, 15], [STAT.MAGAZINE, 1]],
    columns: [[9101, 9102, 9104], MAGS, [9306, 9314], [9311, 9312, 9315], [9402]],
  }),
  weapon({
    hash: 1012, name: "Patient Zero", type: "Combat Bow", slot: "kinetic", ammo: 1, damage: 1,
    flavor: "The first arrow asked a question. The rest are follow-ups.",
    intrinsic: 9004, craftable: true,
    stats: [[STAT.IMPACT, 76], [STAT.ACCURACY, 68], [STAT.STABILITY, 55], [STAT.HANDLING, 57], [STAT.RELOAD, 58], [STAT.AIM_ASSIST, 65], [STAT.ZOOM, 18], [STAT.AIRBORNE, 16], [STAT.RECOIL_DIR, 78], [STAT.DRAW_TIME, 684], [STAT.MAGAZINE, 1]],
    columns: [[9103, 9104, 9105], [9201, 9204, 9205], [9301, 9305, 9306], [9302, 9307, 9315], [9401]],
  }),
];

// Near-identity interpolation curves for the demo stat group; the live
// manifest replaces these with Bungie's real curves.
const BAR_STATS = [
  STAT.IMPACT, STAT.RANGE, STAT.STABILITY, STAT.HANDLING, STAT.RELOAD,
  STAT.AIM_ASSIST, STAT.AIRBORNE, STAT.ACCURACY, STAT.BLAST_RADIUS,
  STAT.VELOCITY, STAT.SHIELD_DURATION,
];

const STAT_NAMES: Record<number, string> = {
  [STAT.IMPACT]: "Impact",
  [STAT.RANGE]: "Range",
  [STAT.STABILITY]: "Stability",
  [STAT.HANDLING]: "Handling",
  [STAT.RELOAD]: "Reload Speed",
  [STAT.RPM]: "Rounds Per Minute",
  [STAT.MAGAZINE]: "Magazine",
  [STAT.AIM_ASSIST]: "Aim Assistance",
  [STAT.ZOOM]: "Zoom",
  [STAT.RECOIL_DIR]: "Recoil Direction",
  [STAT.AIRBORNE]: "Airborne Effectiveness",
  [STAT.CHARGE_TIME]: "Charge Time",
  [STAT.DRAW_TIME]: "Draw Time",
  [STAT.ACCURACY]: "Accuracy",
  [STAT.BLAST_RADIUS]: "Blast Radius",
  [STAT.VELOCITY]: "Velocity",
  [STAT.SHIELD_DURATION]: "Shield Duration",
};

export function buildDemoBundle(): ManifestBundle {
  return {
    version: "demo",
    weapons: Object.fromEntries(WEAPONS.map((w) => [w.hash, w])),
    perks: Object.fromEntries(PERKS.map((p) => [p.hash, p])),
    stats: Object.fromEntries(
      Object.entries(STAT_NAMES).map(([hash, name]) => [
        hash,
        { hash: Number(hash), name, description: "" },
      ]),
    ),
    statGroups: {
      [DEMO_STAT_GROUP]: {
        hash: DEMO_STAT_GROUP,
        maximumValue: 100,
        scaledStats: BAR_STATS.map((statHash) => ({
          statHash,
          maximumValue: 100,
          displayInterpolation: [
            { value: 0, weight: 0 },
            { value: 100, weight: 100 },
          ],
        })),
      },
    },
  };
}
