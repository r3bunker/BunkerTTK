// Downloads the Bungie manifest, trims it to the data BunkerTTK needs,
// and caches the result in IndexedDB keyed by manifest version.

import { idbGet, idbSet, idbDelete } from "./idb.ts";
import type {
  ManifestBundle,
  PerkDef,
  SocketColumn,
  StatDef,
  StatGroupDef,
  WeaponDef,
} from "../types.ts";

export const BUNGIE_ROOT = "https://www.bungie.net";

const CACHE_KEY = "manifest-bundle";

const SLOT_HASHES: Record<number, WeaponDef["weaponSlot"]> = {
  1498876634: "kinetic",
  2465295065: "energy",
  953998645: "power",
};

const SOCKET_CATEGORY_INTRINSIC = 3956125808;
const SOCKET_CATEGORY_WEAPON_PERKS = 4241085061;

// Plug categories that show up inside weapon perk sockets but aren't perks.
const PLUG_CATEGORY_BLOCKLIST =
  /shader|skin|ornament|memento|tracker|empty|crafting|extract|glow|paint/i;

type StatusCallback = (message: string) => void;

interface RawDisplay {
  name?: string;
  description?: string;
  icon?: string;
}

interface RawItemDef {
  hash: number;
  displayProperties?: RawDisplay;
  flavorText?: string;
  itemType?: number;
  itemTypeDisplayName?: string;
  iconWatermark?: string;
  screenshot?: string;
  inventory?: { tierType?: number; tierTypeName?: string; recipeItemHash?: number };
  equippingBlock?: { equipmentSlotTypeHash?: number; ammoType?: number };
  defaultDamageType?: number;
  stats?: { statGroupHash?: number };
  investmentStats?: { statTypeHash: number; value: number; isConditionallyActive?: boolean }[];
  plug?: { plugCategoryIdentifier?: string };
  sockets?: {
    socketEntries?: {
      singleInitialItemHash?: number;
      reusablePlugSetHash?: number;
      randomizedPlugSetHash?: number;
      reusablePlugItems?: { plugItemHash: number }[];
    }[];
    socketCategories?: { socketCategoryHash: number; socketIndexes: number[] }[];
  };
}

interface RawPlugSetDef {
  reusablePlugItems?: { plugItemHash: number; currentlyCanRoll?: boolean }[];
}

async function bungieFetch<T>(path: string, apiKey?: string): Promise<T> {
  const res = await fetch(`${BUNGIE_ROOT}${path}`, {
    headers: apiKey ? { "X-API-Key": apiKey } : undefined,
  });
  if (!res.ok) {
    throw new Error(`Bungie request failed (${res.status}) for ${path}`);
  }
  return (await res.json()) as T;
}

export async function getCachedBundle(): Promise<ManifestBundle | undefined> {
  try {
    return await idbGet<ManifestBundle>(CACHE_KEY);
  } catch {
    return undefined;
  }
}

export async function clearCachedBundle(): Promise<void> {
  await idbDelete(CACHE_KEY);
}

/**
 * Load the live Bungie manifest. Requires an API key
 * (free at https://www.bungie.net/en/Application) because the manifest
 * index endpoint demands one; the content files themselves do not.
 */
export async function loadLiveManifest(
  apiKey: string,
  onStatus: StatusCallback,
): Promise<ManifestBundle> {
  onStatus("Fetching manifest index…");
  const index = await bungieFetch<{
    ErrorCode?: number;
    Message?: string;
    Response?: {
      version: string;
      jsonWorldComponentContentPaths: Record<string, Record<string, string>>;
    };
  }>("/Platform/Destiny2/Manifest/", apiKey);

  if (!index.Response) {
    throw new Error(`Bungie API error: ${index.Message ?? "no response"}`);
  }

  const version = index.Response.version;
  const cached = await getCachedBundle();
  if (cached && cached.version === version) {
    onStatus("Manifest up to date (cached).");
    return cached;
  }

  const paths = index.Response.jsonWorldComponentContentPaths.en;

  onStatus("Downloading item definitions (~80 MB, one-time per game update)…");
  const items = await bungieFetch<Record<string, RawItemDef>>(
    paths.DestinyInventoryItemDefinition,
  );

  onStatus("Downloading plug sets…");
  const plugSets = await bungieFetch<Record<string, RawPlugSetDef>>(
    paths.DestinyPlugSetDefinition,
  );

  onStatus("Downloading stat definitions…");
  const rawStats = await bungieFetch<
    Record<string, { hash: number; displayProperties?: RawDisplay }>
  >(paths.DestinyStatDefinition);

  onStatus("Downloading stat groups…");
  const rawStatGroups = await bungieFetch<
    Record<
      string,
      {
        hash: number;
        maximumValue: number;
        scaledStats?: {
          statHash: number;
          maximumValue: number;
          displayInterpolation: { value: number; weight: number }[];
        }[];
      }
    >
  >(paths.DestinyStatGroupDefinition);

  onStatus("Trimming manifest…");
  const bundle = buildBundle(version, items, plugSets, rawStats, rawStatGroups);

  onStatus("Caching…");
  await idbSet(CACHE_KEY, bundle);
  return bundle;
}

function buildBundle(
  version: string,
  items: Record<string, RawItemDef>,
  plugSets: Record<string, RawPlugSetDef>,
  rawStats: Record<string, { hash: number; displayProperties?: RawDisplay }>,
  rawStatGroups: Record<
    string,
    {
      hash: number;
      maximumValue: number;
      scaledStats?: StatGroupDef["scaledStats"];
    }
  >,
): ManifestBundle {
  const weapons: Record<number, WeaponDef> = {};
  const referencedPlugs = new Set<number>();
  const referencedStatGroups = new Set<number>();

  const plugSetItems = (hash: number | undefined): number[] => {
    if (hash === undefined) return [];
    const set = plugSets[hash];
    if (!set?.reusablePlugItems) return [];
    // keep currently-rollable plugs plus anything with no roll info
    return set.reusablePlugItems
      .filter((p) => p.currentlyCanRoll !== false)
      .map((p) => p.plugItemHash);
  };

  const isRealPerk = (plugHash: number): boolean => {
    const def = items[plugHash];
    if (!def?.displayProperties?.name) return false;
    const cat = def.plug?.plugCategoryIdentifier ?? "";
    return !PLUG_CATEGORY_BLOCKLIST.test(cat);
  };

  for (const raw of Object.values(items)) {
    if (raw.itemType !== 3) continue; // weapons only
    const slot = SLOT_HASHES[raw.equippingBlock?.equipmentSlotTypeHash ?? 0];
    if (!slot) continue;
    if (!raw.displayProperties?.name) continue;

    const entries = raw.sockets?.socketEntries ?? [];
    const categories = raw.sockets?.socketCategories ?? [];

    // intrinsic frame
    let intrinsicHash: number | null = null;
    const intrinsicCat = categories.find(
      (c) => c.socketCategoryHash === SOCKET_CATEGORY_INTRINSIC,
    );
    if (intrinsicCat) {
      for (const idx of intrinsicCat.socketIndexes) {
        const h = entries[idx]?.singleInitialItemHash;
        if (h) {
          intrinsicHash = h;
          referencedPlugs.add(h);
          break;
        }
      }
    }

    // perk columns (barrels / mags / traits / origin)
    const perkColumns: SocketColumn[] = [];
    const perkCat = categories.find(
      (c) => c.socketCategoryHash === SOCKET_CATEGORY_WEAPON_PERKS,
    );
    if (perkCat) {
      for (const idx of perkCat.socketIndexes) {
        const entry = entries[idx];
        if (!entry) continue;
        const randomized = entry.randomizedPlugSetHash !== undefined;
        let plugHashes = plugSetItems(
          entry.randomizedPlugSetHash ?? entry.reusablePlugSetHash,
        );
        if (plugHashes.length === 0 && entry.reusablePlugItems?.length) {
          plugHashes = entry.reusablePlugItems.map((p) => p.plugItemHash);
        }
        if (plugHashes.length === 0 && entry.singleInitialItemHash) {
          plugHashes = [entry.singleInitialItemHash];
        }
        plugHashes = [...new Set(plugHashes)].filter(isRealPerk);
        if (plugHashes.length === 0) continue;

        const initial = entry.singleInitialItemHash ?? null;
        perkColumns.push({
          socketIndex: idx,
          plugHashes,
          initialPlugHash: initial && plugHashes.includes(initial) ? initial : null,
          randomized,
        });
        plugHashes.forEach((h) => referencedPlugs.add(h));
      }
    }

    if (raw.stats?.statGroupHash) referencedStatGroups.add(raw.stats.statGroupHash);

    weapons[raw.hash] = {
      hash: raw.hash,
      name: raw.displayProperties.name,
      flavorText: raw.flavorText ?? "",
      icon: raw.displayProperties.icon ?? null,
      watermark: raw.iconWatermark ?? null,
      screenshot: raw.screenshot ?? null,
      tierType: raw.inventory?.tierType ?? 0,
      tierTypeName: raw.inventory?.tierTypeName ?? "",
      itemTypeDisplayName: raw.itemTypeDisplayName ?? "",
      weaponSlot: slot,
      ammoType: raw.equippingBlock?.ammoType ?? 0,
      damageType: raw.defaultDamageType ?? 0,
      intrinsicHash,
      statGroupHash: raw.stats?.statGroupHash ?? null,
      investmentStats: (raw.investmentStats ?? []).map((s) => ({
        statHash: s.statTypeHash,
        value: s.value,
      })),
      perkColumns,
      craftable: raw.inventory?.recipeItemHash !== undefined,
    };
  }

  const perks: Record<number, PerkDef> = {};
  for (const hash of referencedPlugs) {
    const raw = items[hash];
    if (!raw) continue;
    perks[hash] = {
      hash,
      name: raw.displayProperties?.name ?? "Unknown",
      description: raw.displayProperties?.description ?? "",
      icon: raw.displayProperties?.icon ?? null,
      itemTypeDisplayName: raw.itemTypeDisplayName ?? "",
      investmentStats: (raw.investmentStats ?? []).map((s) => ({
        statHash: s.statTypeHash,
        value: s.value,
        isConditionallyActive: s.isConditionallyActive ?? false,
      })),
      plugCategory: raw.plug?.plugCategoryIdentifier ?? "",
    };
  }

  const stats: Record<number, StatDef> = {};
  for (const raw of Object.values(rawStats)) {
    if (!raw.displayProperties?.name) continue;
    stats[raw.hash] = {
      hash: raw.hash,
      name: raw.displayProperties.name,
      description: raw.displayProperties.description ?? "",
    };
  }

  const statGroups: Record<number, StatGroupDef> = {};
  for (const hash of referencedStatGroups) {
    const raw = rawStatGroups[hash];
    if (!raw) continue;
    statGroups[hash] = {
      hash: raw.hash,
      maximumValue: raw.maximumValue,
      scaledStats: raw.scaledStats ?? [],
    };
  }

  return { version, weapons, perks, stats, statGroups };
}
