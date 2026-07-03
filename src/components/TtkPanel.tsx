import { useEffect, useMemo, useState } from "react";
import {
  computeTtk,
  DEFAULT_RESILIENCE_HP,
  findArchetype,
  type DamageProfile,
} from "../lib/ttk.ts";

export function TtkPanel({ weaponType, rpmStat }: { weaponType: string; rpmStat?: number }) {
  const archetype = useMemo(() => findArchetype(weaponType, rpmStat), [weaponType, rpmStat]);

  const [crit, setCrit] = useState(archetype?.critDamage ?? 0);
  const [body, setBody] = useState(archetype?.bodyDamage ?? 0);
  const [rpm, setRpm] = useState(archetype?.rpm ?? 0);

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
      </div>

      <div className="table-scroll">
        <table className="ttk-table">
          <thead>
            <tr>
              <th>Resilience</th>
              <th>HP</th>
              {!archetype.noCrit && <th>Optimal TTK</th>}
              {!archetype.noCrit && <th>Crit shots</th>}
              {!archetype.noCrit && <th>Forgiveness</th>}
              <th>Body TTK</th>
              <th>Body shots</th>
            </tr>
          </thead>
          <tbody>
            {DEFAULT_RESILIENCE_HP.map((hp, tier) => {
              const r = computeTtk(profile, hp);
              if (!r) return null;
              return (
                <tr key={tier} className={tier === 6 ? "highlight" : ""}>
                  <td>T{tier}</td>
                  <td>{hp}</td>
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
        Damage values are community approximations (not in the Bungie API) and drift with sandbox
        patches — edit the numbers above to match current in-game values. TTK assumes the first
        shot lands at t=0 and perfect fire rate. T6 highlighted as the most common PvP resilience.
      </p>
    </div>
  );
}
