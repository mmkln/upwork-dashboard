import type {
  MarketSignalFilters,
  MarketSignalsBoardConfig,
} from "./types";

const now = new Date().toISOString();

export const MARKET_SIGNAL_STORAGE_KEYS = {
  boards: "marketSignals.boards.v1",
  activeBoardId: "marketSignals.activeBoardId.v1",
  overrides: "marketSignals.overrides.v1",
};

export const DEFAULT_MARKET_SIGNAL_BOARD: MarketSignalsBoardConfig = {
  id: "default-market-signals-board",
  name: "Market Signals Board",
  goal: "Freelance opportunity research",
  marketQuery: "GoHighLevel automation",
  sourceCollectionId: null,
  includeKeywords: [
    "gohighlevel",
    "go high level",
    "ghl",
    "crm",
    "automation",
  ],
  excludeKeywords: ["tutorial", "course", "training"],
  createdAt: now,
  updatedAt: now,
};

export const DEFAULT_MARKET_SIGNAL_FILTERS: MarketSignalFilters = {
  keyword: "",
  relevanceStatus: "All",
  requestCategory: "All",
  clientType: "All",
  buyerNeed: "All",
  requiredSkill: "All",
  relatedTool: "All",
  minimumScore: 0,
};

export const UNKNOWN_VALUE = "Unknown";

