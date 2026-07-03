import type { ComputedStat } from "../lib/stats.ts";

export function StatBars({ stats }: { stats: ComputedStat[] }) {
  return (
    <div className="stat-bars">
      {stats.map((s) => {
        const delta = s.display - s.baseDisplay;
        return (
          <div key={s.statHash} className="stat-row">
            <span className="stat-name">{s.name}</span>
            {s.bar ? (
              <span className="stat-bar">
                <span
                  className="stat-bar-fill"
                  style={{ width: `${Math.min(100, (Math.max(0, s.display) / s.max) * 100)}%` }}
                />
                {delta > 0 && (
                  <span
                    className="stat-bar-delta gain"
                    style={{
                      left: `${Math.min(100, (Math.max(0, s.baseDisplay) / s.max) * 100)}%`,
                      width: `${Math.min(100, (delta / s.max) * 100)}%`,
                    }}
                  />
                )}
              </span>
            ) : (
              <span className="stat-bar numeric" />
            )}
            <span className={`stat-value ${delta > 0 ? "gain" : delta < 0 ? "loss" : ""}`}>
              {s.display}
              {delta !== 0 && (
                <em className="stat-delta">
                  {" "}({delta > 0 ? "+" : ""}{delta})
                </em>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
