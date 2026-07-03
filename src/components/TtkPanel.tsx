import { useEffect, useMemo, useState } from "react";
import {
  computeTtkAtWeaponsStat,
  CRUCIBLE_HP,
  findArchetype,
  WEAPONS_STAT_ROWS,
  weaponsStatMultiplier,
  type DamageProfile,
} from "../lib/ttk.ts";

export function TtkPanel({ weaponType, rpmStat }: { weaponType: string; rpmStat?: number }) {
  const archetype = useMemo(() => findArchetype(weaponType, rpmStat), [weaponType, rpmStat]);

  const [crit, setCrit] = useState(archetype?.critDamage ?? 0);
  const [body, setBody] = useState(archetype?.bodyDamage ?? 0);
  const [rpm, setRpm] = useState(archetype?.rpm ?? 0);
  const [hp, setHp] = useState(CRUCIBLE_HP);

  // Re-seed inputs when navigating between weapons of different archetypes.
  useEffect(() => {
    setCrit(archetype?.critDamage ?? 0);
    setBody(archetype?.bodyDamage ?? 0);
    setRpm(archetype?.rpm ?? 0);
  }, [archetype]);

  if (!archetype) {
    return (
      <p className="muted">
        No damage data for “{weaponType}”. Damage values aren't in the Bungie manifest — this
        weapon type isn't in the community table yet.
      </p>
    );
  }

  const profile: DamageProfile = { ...archetype, critDamage: crit, bodyDamage: body, rpm };
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
        drops a shot are marked. Damage values are community approximations (not in the Bungie
        API) — edit the numbers above to match in-game testing. TTK assumes the first shot lands
        at t=0 and a perfect fire rate.
      </p>
    </div>
  );
}
