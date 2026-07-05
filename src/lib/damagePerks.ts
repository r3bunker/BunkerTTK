// Weapon perks that change PvP time-to-kill, in the spirit of godroll.tv's
// PvP mode: when one of these perks appears in a weapon's perk pool, the TTK
// panel offers it as a toggle and applies its multiplier.
//
// Multipliers are the community-measured values against Guardians (PvP), not
// the larger PvE numbers. Several of these ramp with stacks or hits — the
// value used here is the maximum, and the note says how it activates. Like
// the damage table itself, these are approximations that can drift; see
// CourtProjects' "Destiny 2 Damage Buffs/Debuffs" sheet for the living data.

export interface DamagePerkSpec {
  /** exact perk name, matched case-insensitively against manifest plug names */
  name: string;
  /** damage multiplier vs Guardians applied to crit and body (e.g. 1.25) */
  damageMult?: number;
  /** rate-of-fire multiplier (e.g. Desperado) */
  rpmMult?: number;
  /** activation condition shown in the UI */
  note: string;
}

export const DAMAGE_PERKS: DamagePerkSpec[] = [
  { name: "Kill Clip", damageMult: 1.25, note: "reload within 3.6s of a kill; 5s duration" },
  { name: "Multikill Clip", damageMult: 1.25, note: "max stacks — reload after a rapid multikill" },
  { name: "Rampage", damageMult: 1.1, note: "max stacks (×3) — very hard to reach in PvP" },
  { name: "Swashbuckler", damageMult: 1.045, note: "max stacks (×5) — melee kill grants max instantly" },
  { name: "Golden Tricorn", damageMult: 1.15, note: "×2 — needs a matching grenade/melee kill" },
  { name: "High-Impact Reserves", damageMult: 1.097, note: "bottom half of magazine, max on final rounds" },
  { name: "Precision Instrument", damageMult: 1.06, note: "ramps with consecutive precision hits (approx.)" },
  { name: "Target Lock", damageMult: 1.1, note: "sustained fire on one target (max ramp)" },
  { name: "Frenzy", damageMult: 1.15, note: "in combat for 12s" },
  { name: "Adrenaline Junkie", damageMult: 1.067, note: "max stacks — grenade kill required" },
  { name: "Vorpal Weapon", damageMult: 1.077, note: "only vs Guardians in their Super" },
  { name: "Bait and Switch", damageMult: 1.2, note: "hit with all equipped weapons within 3s" },
  { name: "Explosive Payload", damageMult: 1.075, note: "split damage; blast ignores range falloff (approx.)" },
  { name: "Timed Payload", damageMult: 1.075, note: "split damage with delayed blast (approx.)" },
  { name: "Box Breathing", damageMult: 1.15, note: "aim down sights 3s without firing (approx.)" },
  { name: "Elemental Honing", damageMult: 1.1, note: "max stacks — kills with matching damage types" },
  { name: "Desperado", rpmMult: 1.3, note: "reload after a precision kill — faster fire rate" },
  { name: "Onslaught", rpmMult: 1.35, note: "max stacks (×3) — faster fire rate" },
];

const BY_NAME = new Map(DAMAGE_PERKS.map((p) => [p.name.toLowerCase(), p]));

/** Look up a TTK-affecting perk spec by perk name (case-insensitive). */
export function damagePerkFor(perkName: string): DamagePerkSpec | undefined {
  return BY_NAME.get(perkName.toLowerCase());
}

/** Combined damage / RPM multipliers for a set of active perk names. */
export function combinedPerkMultipliers(activeNames: Iterable<string>): {
  damage: number;
  rpm: number;
} {
  let damage = 1;
  let rpm = 1;
  for (const name of activeNames) {
    const spec = damagePerkFor(name);
    if (!spec) continue;
    if (spec.damageMult) damage *= spec.damageMult;
    if (spec.rpmMult) rpm *= spec.rpmMult;
  }
  return { damage, rpm };
}
