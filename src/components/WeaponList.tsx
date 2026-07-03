import { useMemo, useState } from "react";
import { AMMO_NAMES, DAMAGE_TYPE_NAMES, type ManifestBundle, type WeaponDef } from "../types.ts";
import { ElementDot, WeaponIcon } from "./common.tsx";

const SLOT_LABELS: Record<WeaponDef["weaponSlot"], string> = {
  kinetic: "Kinetic",
  energy: "Energy",
  power: "Power",
};

export function WeaponList({ bundle }: { bundle: ManifestBundle }) {
  const [query, setQuery] = useState("");
  const [slot, setSlot] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [damage, setDamage] = useState<string>("");
  const [ammo, setAmmo] = useState<string>("");
  const [tier, setTier] = useState<string>("");
  const [craftableOnly, setCraftableOnly] = useState(false);

  const weapons = useMemo(() => Object.values(bundle.weapons), [bundle]);

  const typeOptions = useMemo(
    () => [...new Set(weapons.map((w) => w.itemTypeDisplayName))].filter(Boolean).sort(),
    [weapons],
  );
  const tierOptions = useMemo(
    () => [...new Set(weapons.map((w) => w.tierTypeName))].filter(Boolean).sort(),
    [weapons],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = weapons.filter((w) => {
      if (q && !w.name.toLowerCase().includes(q) && !w.itemTypeDisplayName.toLowerCase().includes(q)) return false;
      if (slot && w.weaponSlot !== slot) return false;
      if (type && w.itemTypeDisplayName !== type) return false;
      if (damage && String(w.damageType) !== damage) return false;
      if (ammo && String(w.ammoType) !== ammo) return false;
      if (tier && w.tierTypeName !== tier) return false;
      if (craftableOnly && !w.craftable) return false;
      return true;
    });
    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [weapons, query, slot, type, damage, ammo, tier, craftableOnly]);

  // Cap rendering for the full live manifest (thousands of items).
  const CAP = 300;
  const shown = filtered.slice(0, CAP);

  return (
    <div className="weapon-list">
      <div className="filter-bar">
        <input
          className="search"
          type="search"
          placeholder="Search weapons…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <select value={slot} onChange={(e) => setSlot(e.target.value)}>
          <option value="">Any slot</option>
          {Object.entries(SLOT_LABELS).map(([v, label]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Any type</option>
          {typeOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select value={damage} onChange={(e) => setDamage(e.target.value)}>
          <option value="">Any element</option>
          {Object.entries(DAMAGE_TYPE_NAMES).map(([v, label]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>
        <select value={ammo} onChange={(e) => setAmmo(e.target.value)}>
          <option value="">Any ammo</option>
          {Object.entries(AMMO_NAMES).map(([v, label]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>
        <select value={tier} onChange={(e) => setTier(e.target.value)}>
          <option value="">Any rarity</option>
          {tierOptions.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={craftableOnly}
            onChange={(e) => setCraftableOnly(e.target.checked)}
          />
          Craftable
        </label>
      </div>

      <div className="result-count">
        {filtered.length} weapon{filtered.length === 1 ? "" : "s"}
        {filtered.length > CAP ? ` (showing first ${CAP} — refine your search)` : ""}
      </div>

      <div className="weapon-grid">
        {shown.map((w) => (
          <a key={w.hash} className="weapon-card" href={`#/weapon/${w.hash}`}>
            <WeaponIcon weapon={w} />
            <div className="weapon-card-body">
              <div className="weapon-card-name">
                {w.name}
                {w.craftable && <span className="craftable-mark" title="Craftable">⌗</span>}
              </div>
              <div className="weapon-card-meta">
                <ElementDot damageType={w.damageType} />
                {w.itemTypeDisplayName} · {SLOT_LABELS[w.weaponSlot]} · {w.tierTypeName}
              </div>
            </div>
          </a>
        ))}
      </div>
      {shown.length === 0 && <div className="empty">No weapons match those filters.</div>}
    </div>
  );
}
