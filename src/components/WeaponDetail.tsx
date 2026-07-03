import { useMemo, useState } from "react";
import {
  AMMO_NAMES,
  DAMAGE_TYPE_NAMES,
  STAT,
  type ManifestBundle,
  type PerkDef,
  type WeaponDef,
} from "../types.ts";
import { computeStats, masterworkOptions } from "../lib/stats.ts";
import { BUNGIE_ROOT } from "../lib/manifest.ts";
import { ElementDot, PerkIcon, WeaponIcon } from "./common.tsx";
import { StatBars } from "./StatBars.tsx";
import { TtkPanel } from "./TtkPanel.tsx";

export function WeaponDetail({ weapon, bundle }: { weapon: WeaponDef; bundle: ManifestBundle }) {
  // selected plug hash per perk column index
  const [selected, setSelected] = useState<Record<number, number | undefined>>({});
  const [masterworkStat, setMasterworkStat] = useState<number | null>(null);
  const [includeConditional, setIncludeConditional] = useState(false);

  const selectedPerks = useMemo(() => {
    const perks: PerkDef[] = [];
    for (const col of weapon.perkColumns) {
      const hash = selected[col.socketIndex];
      if (hash !== undefined) {
        const p = bundle.perks[hash];
        if (p) perks.push(p);
      }
    }
    return perks;
  }, [selected, weapon, bundle]);

  const stats = useMemo(
    () => computeStats(weapon, bundle, { perks: selectedPerks, masterworkStat, includeConditional }),
    [weapon, bundle, selectedPerks, masterworkStat, includeConditional],
  );

  const intrinsic = weapon.intrinsicHash ? bundle.perks[weapon.intrinsicHash] : undefined;
  const mwOptions = masterworkOptions(weapon);
  const rpmStat = weapon.investmentStats.find((s) => s.statHash === STAT.RPM)?.value;
  const hasConditional = selectedPerks.some((p) =>
    p.investmentStats.some((s) => s.isConditionallyActive),
  );

  const toggle = (socketIndex: number, plugHash: number) =>
    setSelected((prev) => ({
      ...prev,
      [socketIndex]: prev[socketIndex] === plugHash ? undefined : plugHash,
    }));

  return (
    <div className="weapon-detail">
      <a className="back-link" href="#/">← All weapons</a>

      <div
        className="detail-header"
        style={
          weapon.screenshot
            ? { backgroundImage: `linear-gradient(rgba(10,12,16,.55), rgba(10,12,16,.92)), url(${BUNGIE_ROOT}${weapon.screenshot})` }
            : undefined
        }
      >
        <WeaponIcon weapon={weapon} size={72} />
        <div>
          <h1>{weapon.name}</h1>
          <div className="detail-sub">
            <ElementDot damageType={weapon.damageType} />
            {DAMAGE_TYPE_NAMES[weapon.damageType]} · {weapon.itemTypeDisplayName} ·{" "}
            {AMMO_NAMES[weapon.ammoType] ?? "?"} ammo · {weapon.tierTypeName}
            {weapon.craftable && " · Craftable"}
          </div>
          {intrinsic && <div className="detail-frame">{intrinsic.name}</div>}
          {weapon.flavorText && <p className="flavor">{weapon.flavorText}</p>}
        </div>
      </div>

      <div className="detail-columns">
        <section className="panel">
          <h2>Perks</h2>
          {weapon.perkColumns.length === 0 && <p className="muted">No perk data for this weapon.</p>}
          <div className="perk-columns">
            {weapon.perkColumns.map((col) => (
              <div key={col.socketIndex} className={`perk-column ${col.randomized ? "random" : ""}`}>
                {col.plugHashes.map((hash) => {
                  const p = bundle.perks[hash];
                  if (!p) return null;
                  const active = selected[col.socketIndex] === hash;
                  return (
                    <button
                      key={hash}
                      className={`perk-btn ${active ? "active" : ""}`}
                      title={`${p.name}\n${p.description}`}
                      onClick={() => toggle(col.socketIndex, hash)}
                    >
                      <PerkIcon perk={p} />
                      <span className="perk-name">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {mwOptions.length > 0 && (
            <div className="masterwork-row">
              <label>Masterwork (T10)</label>
              <select
                value={masterworkStat ?? ""}
                onChange={(e) => setMasterworkStat(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">None</option>
                {mwOptions.map((h) => (
                  <option key={h} value={h}>{bundle.stats[h]?.name ?? h} +10</option>
                ))}
              </select>
            </div>
          )}

          {hasConditional && (
            <label className="checkbox conditional-toggle">
              <input
                type="checkbox"
                checked={includeConditional}
                onChange={(e) => setIncludeConditional(e.target.checked)}
              />
              Apply conditional perk bonuses (perks that only activate situationally)
            </label>
          )}

          {selectedPerks.length > 0 && (
            <div className="selected-perk-descriptions">
              {selectedPerks.map((p) => (
                <div key={p.hash} className="perk-desc">
                  <strong>{p.name}</strong> — {p.description}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <h2>Stats</h2>
          <StatBars stats={stats} />
        </section>
      </div>

      <section className="panel">
        <h2>Time to Kill (Crucible)</h2>
        <TtkPanel weaponType={weapon.itemTypeDisplayName} rpmStat={rpmStat} />
      </section>
    </div>
  );
}
