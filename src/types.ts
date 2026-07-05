// Trimmed representations of Bungie manifest definitions.
// We only persist the fields the app actually uses, which keeps the
// IndexedDB cache small (a few MB instead of the ~100MB raw manifest).

export interface StatValue {
  statHash: number;
  value: number;
}

export interface SocketColumn {
  /** Index of the socket in the weapon's socketEntries */
  socketIndex: number;
  /** Perk item hashes available in this column */
  plugHashes: number[];
  /** Hash of the plug equipped by default (curated roll) */
  initialPlugHash: number | null;
  /** True when the column comes from a randomized plug set (random roll pool) */
  randomized: boolean;
}

export interface WeaponDef {
  hash: number;
  name: string;
  flavorText: string;
  icon: string | null; // bungie.net relative path, null for bundled demo data
  watermark: string | null;
  screenshot: string | null;
  tierType: number; // 5 = legendary, 6 = exotic
  tierTypeName: string;
  itemTypeDisplayName: string; // "Hand Cannon", "Pulse Rifle", ...
  weaponSlot: "kinetic" | "energy" | "power";
  ammoType: number; // DestinyAmmunitionType: 1 primary, 2 special, 3 heavy
  damageType: number; // DestinyDamageType: 1 kinetic, 2 arc, 3 solar, 4 void, 6 stasis, 7 strand
  /** Intrinsic frame plug hash (e.g. "Adaptive Frame") */
  intrinsicHash: number | null;
  statGroupHash: number | null;
  investmentStats: StatValue[];
  perkColumns: SocketColumn[];
  craftable: boolean;
}

export interface PerkDef {
  hash: number;
  name: string;
  description: string;
  icon: string | null;
  itemTypeDisplayName: string;
  investmentStats: (StatValue & { isConditionallyActive: boolean })[];
  /** plugCategoryIdentifier, used to classify (intrinsic / trait / barrel / mag / masterwork) */
  plugCategory: string;
}

export interface StatDef {
  hash: number;
  name: string;
  description: string;
}

export interface StatGroupScaledStat {
  statHash: number;
  maximumValue: number;
  displayInterpolation: { value: number; weight: number }[];
}

export interface StatGroupDef {
  hash: number;
  maximumValue: number;
  scaledStats: StatGroupScaledStat[];
}

export interface ManifestBundle {
  /** Bungie manifest version string, or "demo" for the bundled dataset */
  version: string;
  weapons: Record<number, WeaponDef>;
  perks: Record<number, PerkDef>;
  stats: Record<number, StatDef>;
  statGroups: Record<number, StatGroupDef>;
}

// ---- constants ----

export const STAT = {
  IMPACT: 4043523819,
  RANGE: 1240592695,
  STABILITY: 155624089,
  HANDLING: 943549884,
  RELOAD: 4188031367,
  RPM: 4284893193,
  MAGAZINE: 3871231066,
  AIM_ASSIST: 1345609583,
  ZOOM: 3555269338,
  RECOIL_DIR: 2715839340,
  AIRBORNE: 2714457168,
  CHARGE_TIME: 2961396640,
  DRAW_TIME: 447667954,
  ACCURACY: 1591432999,
  BLAST_RADIUS: 3614673599,
  VELOCITY: 2523465841,
  SHIELD_DURATION: 1842278586,
} as const;

export const DAMAGE_TYPE_NAMES: Record<number, string> = {
  1: "Kinetic",
  2: "Arc",
  3: "Solar",
  4: "Void",
  6: "Stasis",
  7: "Strand",
};

export const AMMO_NAMES: Record<number, string> = {
  1: "Primary",
  2: "Special",
  3: "Heavy",
};
