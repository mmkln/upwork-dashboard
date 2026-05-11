import {
  DEFAULT_MARKET_SIGNAL_BOARD,
  MARKET_SIGNAL_STORAGE_KEYS,
} from "./constants";
import type {
  MarketSignalOverride,
  MarketSignalsBoardConfig,
} from "./types";

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

export const loadMarketSignalBoards = (): MarketSignalsBoardConfig[] => {
  const boards = readJson<MarketSignalsBoardConfig[]>(
    MARKET_SIGNAL_STORAGE_KEYS.boards,
    [],
  );
  return boards.length ? boards : [DEFAULT_MARKET_SIGNAL_BOARD];
};

export const saveMarketSignalBoards = (boards: MarketSignalsBoardConfig[]) => {
  writeJson(MARKET_SIGNAL_STORAGE_KEYS.boards, boards);
};

export const loadActiveMarketSignalBoardId = () => {
  if (!isBrowser()) return DEFAULT_MARKET_SIGNAL_BOARD.id;
  return (
    window.localStorage.getItem(MARKET_SIGNAL_STORAGE_KEYS.activeBoardId) ??
    DEFAULT_MARKET_SIGNAL_BOARD.id
  );
};

export const saveActiveMarketSignalBoardId = (boardId: string) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(MARKET_SIGNAL_STORAGE_KEYS.activeBoardId, boardId);
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

