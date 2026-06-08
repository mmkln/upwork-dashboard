import type { MarketSignalFilters } from "../types";

export const marketSignalsKeys = {
  all: ["marketSignals"] as const,
  board: (researchId: string | null, filters?: MarketSignalFilters) =>
    [...marketSignalsKeys.all, "board", researchId, filters] as const,
  researchList: () => [...marketSignalsKeys.all, "researchList"] as const,
};
