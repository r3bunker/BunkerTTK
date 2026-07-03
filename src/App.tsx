import { useCallback, useEffect, useState } from "react";
import type { ManifestBundle } from "./types.ts";
import { buildDemoBundle } from "./lib/demoData.ts";
import { clearCachedBundle, getCachedBundle, loadLiveManifest } from "./lib/manifest.ts";
import { WeaponList } from "./components/WeaponList.tsx";
import { WeaponDetail } from "./components/WeaponDetail.tsx";

type Route = { view: "list" } | { view: "weapon"; hash: number };

function parseRoute(): Route {
  const m = window.location.hash.match(/^#\/weapon\/(\d+)$/);
  return m ? { view: "weapon", hash: Number(m[1]) } : { view: "list" };
}

const API_KEY_STORAGE = "bunkerttk-api-key";

export default function App() {
  const [bundle, setBundle] = useState<ManifestBundle | null>(null);
  const [route, setRoute] = useState<Route>(parseRoute());
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) ?? "");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const onHash = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Start with cached live data when available, otherwise the bundled demo set.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await getCachedBundle();
      if (!cancelled) setBundle(cached ?? buildDemoBundle());
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadLive = useCallback(async () => {
    if (!apiKey.trim()) {
      setStatus("Enter a Bungie API key first (free at bungie.net/en/Application).");
      return;
    }
    localStorage.setItem(API_KEY_STORAGE, apiKey.trim());
    setLoading(true);
    try {
      const live = await loadLiveManifest(apiKey.trim(), setStatus);
      setBundle(live);
      setStatus(`Loaded live manifest ${live.version} (${Object.keys(live.weapons).length} weapons).`);
      setShowSettings(false);
    } catch (e) {
      setStatus(`Failed to load live manifest: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  const resetToDemo = useCallback(async () => {
    await clearCachedBundle();
    setBundle(buildDemoBundle());
    setStatus("Reverted to bundled sample data.");
  }, []);

  if (!bundle) {
    return <div className="app-loading">Loading…</div>;
  }

  const isDemo = bundle.version === "demo";
  const weapon = route.view === "weapon" ? bundle.weapons[route.hash] : undefined;

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#/">
          <span className="brand-mark">◆</span> Bunker<span className="brand-accent">TTK</span>
        </a>
        <span className="topbar-sub">Destiny 2 weapon foundry &amp; TTK calculator</span>
        <div className="topbar-right">
          <span className={`data-badge ${isDemo ? "demo" : "live"}`}>
            {isDemo ? "SAMPLE DATA" : `LIVE · ${bundle.version}`}
          </span>
          <button className="btn subtle" onClick={() => setShowSettings((s) => !s)}>
            Data source
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="settings-panel">
          <p>
            Load the live Bungie manifest to browse every weapon in the game. You need a free API
            key from{" "}
            <a href="https://www.bungie.net/en/Application" target="_blank" rel="noreferrer">
              bungie.net/en/Application
            </a>{" "}
            (any app registration works; the key is stored only in your browser).
          </p>
          <div className="settings-row">
            <input
              type="password"
              placeholder="Bungie API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button className="btn primary" onClick={loadLive} disabled={loading}>
              {loading ? "Loading…" : "Load live manifest"}
            </button>
            {!isDemo && (
              <button className="btn" onClick={resetToDemo}>
                Clear &amp; use sample data
              </button>
            )}
          </div>
        </div>
      )}

      {status && (
        <div className="status-bar" onClick={() => setStatus(null)}>
          {status}
        </div>
      )}

      <main>
        {route.view === "weapon" && weapon ? (
          <WeaponDetail weapon={weapon} bundle={bundle} />
        ) : (
          <WeaponList bundle={bundle} />
        )}
      </main>

      <footer className="footer">
        BunkerTTK is an open-source fan project. Not affiliated with Bungie. Damage values are
        community approximations — verify in game.
      </footer>
    </div>
  );
}
