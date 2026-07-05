import { useEffect, useMemo, useState } from "react";
import {
  computeTtkAtWeaponsStat,
  CRUCIBLE_HP,
  findArchetype,
  WEAPONS_STAT_ROWS,
  weaponsStatMultiplier,
  type DamageProfile,
} from "../lib/ttk.ts";
import { combinedPerkMultipliers, damagePerkFor } from "../lib/damagePerks.ts";
import type { PerkDef } from "../types.ts";

export function TtkPanel({
  weaponType,
  rpmStat,
  perkPool = [],
  selectedPerks = [],
}: {
  weaponType: string;
  rpmStat?: number;
  /** all perks available on this weapon (for the damage-perk toggles) */
  perkPool?: PerkDef[];
  /** perks currently selected in the roll editor (pre-toggled) */
  selectedPerks?: PerkDef[];
}) {
  const archetype = useMemo(() => findArchetype(weaponType, rpmStat), [weaponType, rpmStat]);

  const [crit, setCrit] = useState(archetype?.critDamage ?? 0);
  const [body, setBody] = useState(archetype?.bodyDamage ?? 0);
  const [rpm, setRpm] = useState(archetype?.rpm ?? 0);
  const [hp, setHp] = useState(CRUCIBLE_HP);
  // Manual perk-toggle overrides; unset perks follow the roll editor selection.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  // Re-seed inputs when navigating between weapons of different archetypes.
  useEffect(() => {
    setCrit(archetype?.critDamage ?? 0);
    setBody(archetype?.bodyDamage ?? 0);
    setRpm(archetype?.rpm ?? 0);
    setOverrides({});
  }, [archetype]);

  // TTK-affecting perks present anywhere in this weapon's pool, deduped by name.
  const poolDamagePerks = useMemo(() => {
    const seen = new Map<string, PerkDef>();
    for (const p of perkPool) {
      if (damagePerkFor(p.name) && !seen.has(p.name.toLowerCase())) {
        seen.set(p.name.toLowerCase(), p);
      }
    }
    return [...seen.values()];
  }, [perkPool]);

  const selectedNames = useMemo(
    () => new Set(selectedPerks.map((p) => p.name.toLowerCase())),
    [selectedPerks],
  );

  const isActive = (name: string) =>
    overrides[name.toLowerCase()] ?? selectedNames.has(name.toLowerCase());

  const activeNames = poolDamagePerks.map((p) => p.name).filter(isActive);
  const perkMults = combinedPerkMultipliers(activeNames);

  if (!archetype) {
    return (
      <p className="muted">
        No damage data for “{weaponType}”. Damage values aren't in the Bungie manifest — this
        weapon type isn't in the community table yet.
      </p>
    );
  }

  const profile: DamageProfile = {
    ...archetype,
    critDamage: crit * perkMults.damage,
    bodyDamage: body * perkMults.damage,
    rpm: rpm * perkMults.rpm,
  };
  const base = computeTtkAtWeaponsStat(profile, hp, 100);

  return (
    <div className="ttk-panel">
      <div className="ttk-inputs">
        <span className="ttk-archetype">
          Archetype: <strong>{archetype.label}</strong>
        </span>
        {!archetype.noCrit && (
          <label>
            Crit dmg
            <input type="number" value={crit} min={1} step={0.1} onChange={(e) => setCrit(Number(e.target.value))} />
          </label>
        )}
        <label>
          Body dmg
          <input type="number" value={body} min={1} step={0.1} onChange={(e) => setBody(Number(e.target.value))} />
        </label>
        <label>
          RPM
          <input type="number" value={rpm} min={1} onChange={(e) => setRpm(Number(e.target.value))} />
        </label>
        <label>
          Target HP
          <input type="number" value={hp} min={1} onChange={(e) => setHp(Number(e.target.value))} />
        </label>
      </div>

      {poolDamagePerks.length > 0 && (
        <div className="ttk-perks">
          <span className="ttk-perks-label">TTK-affecting perks in this pool:</span>
          {poolDamagePerks.map((p) => {
            const spec = damagePerkFor(p.name)!;
            const active = isActive(p.name);
            const effect = [
              spec.damageMult ? `+${((spec.damageMult - 1) * 100).toFixed(1)}% dmg` : null,
              spec.rpmMult ? `+${((spec.rpmMult - 1) * 100).toFixed(0)}% RPM` : null,
            ]
              .filter(Boolean)
              .join(", ");
            return (
              <button
                key={p.hash}
                className={`perk-chip ${active ? "active" : ""}`}
                title={`${p.name}: ${effect}\nActivation: ${spec.note}`}
                onClick={() =>
                  setOverrides((prev) => ({ ...prev, [p.name.toLowerCase()]: !active }))
                }
              >
                {p.name} <em>{effect}</em>
              </button>
            );
          })}
          {perkMults.damage !== 1 || perkMults.rpm !== 1 ? (
            <span className="ttk-perk-total">
              → effective {profile.critDamage > 0 && !archetype.noCrit
                ? `crit ${profile.critDamage.toFixed(1)} / `
                : ""}
              body {profile.bodyDamage.toFixed(1)}
              {perkMults.rpm !== 1 ? ` @ ${Math.round(profile.rpm)} RPM` : ""}
            </span>
          ) : null}
        </div>
      )}

      <div className="table-scroll">
        <table className="ttk-table">
          <thead>
            <tr>
              <th>Weapons stat</th>
              <th>Dmg bonus</th>
              {!archetype.noCrit && <th>Optimal TTK</th>}
              {!archetype.noCrit && <th>Crit shots</th>}
              {!archetype.noCrit && <th>Forgiveness</th>}
              <th>Body TTK</th>
              <th>Body shots</th>
            </tr>
          </thead>
          <tbody>
            {WEAPONS_STAT_ROWS.map((ws) => {
              const r = computeTtkAtWeaponsStat(profile, hp, ws);
              if (!r) return null;
              const improved = base !== null && r.optimalShots < base.optimalShots;
              return (
                <tr key={ws} className={ws === 100 ? "highlight" : improved ? "breakpoint" : ""}>
                  <td>{ws}{ws === 100 ? " (base)" : ""}</td>
                  <td>+{((weaponsStatMultiplier(ws) - 1) * 100).toFixed(1)}%</td>
                  {!archetype.noCrit && <td className="ttk-strong">{r.optimalTtk.toFixed(2)}s</td>}
                  {!archetype.noCrit && <td>{r.optimalShots}</td>}
                  {!archetype.noCrit && (
                    <td title="Body shots you can hit while keeping the optimal shot count">
                      {r.allowedBodyShots}
                    </td>
                  )}
                  <td>{r.bodyTtk.toFixed(2)}s</td>
                  <td>{r.bodyShots}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="muted small">
        Current sandbox (Monument of Triumph, Update 9.7.0 — the final balance patch): every
        Guardian has a flat {CRUCIBLE_HP} HP in the Crucible; the Health stat only speeds up
        recovery, it does not add HP. The Weapons stat adds +0.05% damage per point above 100
        (max +5% at 200), which is what shifts shot-to-kill breakpoints — rows where the stat
        drops a shot are marked. Perk multipliers use max-stack PvP values (hover a perk for its
        activation condition). Damage values are community approximations (not in the Bungie
        API) — edit the numbers above to match in-game testing. TTK assumes the first shot lands
        at t=0 and a perfect fire rate.
      </p>
    </div>
  );
}
