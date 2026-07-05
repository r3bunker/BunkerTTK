import { BUNGIE_ROOT } from "../lib/manifest.ts";
import { DAMAGE_TYPE_NAMES, type PerkDef, type WeaponDef } from "../types.ts";

export const DAMAGE_COLORS: Record<number, string> = {
  1: "#d8d8d8", // kinetic
  2: "#7aecf3", // arc
  3: "#f0631e", // solar
  4: "#b184c5", // void
  6: "#4d88ff", // stasis
  7: "#35e366", // strand
};

const TYPE_GLYPHS: Record<string, string> = {
  "Hand Cannon": "HC",
  "Auto Rifle": "AR",
  "Pulse Rifle": "PR",
  "Scout Rifle": "SR",
  "Submachine Gun": "SMG",
  "Sidearm": "SA",
  "Combat Bow": "BOW",
  "Sniper Rifle": "SNP",
  "Shotgun": "SG",
  "Fusion Rifle": "FR",
  "Trace Rifle": "TR",
  "Glaive": "GL",
  "Grenade Launcher": "GL",
  "Rocket Launcher": "RL",
  "Linear Fusion Rifle": "LFR",
  "Machine Gun": "MG",
  "Sword": "SW",
};

export function WeaponIcon({ weapon, size = 56 }: { weapon: WeaponDef; size?: number }) {
  if (weapon.icon) {
    return (
      <span className="weapon-icon" style={{ width: size, height: size }}>
        <img src={`${BUNGIE_ROOT}${weapon.icon}`} alt="" width={size} height={size} loading="lazy" />
        {weapon.watermark && (
          <img className="watermark" src={`${BUNGIE_ROOT}${weapon.watermark}`} alt="" width={size} height={size} />
        )}
      </span>
    );
  }
  const color = DAMAGE_COLORS[weapon.damageType] ?? "#999";
  return (
    <span
      className="weapon-icon placeholder"
      style={{ width: size, height: size, borderColor: color, color, fontSize: size * 0.28 }}
    >
      {TYPE_GLYPHS[weapon.itemTypeDisplayName] ?? "?"}
    </span>
  );
}

export function PerkIcon({ perk, size = 36 }: { perk: PerkDef; size?: number }) {
  if (perk.icon) {
    return (
      <img
        className="perk-icon"
        src={`${BUNGIE_ROOT}${perk.icon}`}
        alt=""
        width={size}
        height={size}
        loading="lazy"
      />
    );
  }
  const initials = perk.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
  return (
    <span className="perk-icon placeholder" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </span>
  );
}

export function ElementDot({ damageType }: { damageType: number }) {
  return (
    <span
      className="element-dot"
      title={DAMAGE_TYPE_NAMES[damageType] ?? "Unknown"}
      style={{ background: DAMAGE_COLORS[damageType] ?? "#999" }}
    />
  );
}
