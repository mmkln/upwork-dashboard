import { MARKET_SIGNAL_STORAGE_KEYS } from "./constants";
import type { MarketSignalOverride } from "./types";

const isBrowser = () => typeof window !== "undefined";

const readJson = <T,>(key: string, fallback: T): T => {
  if (!isBrowser()) return fallback;
  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) return fallback;
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
};

const writeJson = <T,>(key: string, value: T) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local storage is a convenience layer for the MVP, not a hard dependency.
  }
};

export const loadMarketSignalOverrides = (): MarketSignalOverride[] =>
  readJson<MarketSignalOverride[]>(MARKET_SIGNAL_STORAGE_KEYS.overrides, []);

export const saveMarketSignalOverrides = (
  overrides: MarketSignalOverride[],
) => {
  writeJson(MARKET_SIGNAL_STORAGE_KEYS.overrides, overrides);
};

export const upsertMarketSignalOverride = (
  overrides: MarketSignalOverride[],
  override: MarketSignalOverride,
) => {
  const nextOverrides = overrides.filter(
    (item) =>
      item.boardId !== override.boardId || item.jobId !== override.jobId,
  );
  return [...nextOverrides, override];
};
