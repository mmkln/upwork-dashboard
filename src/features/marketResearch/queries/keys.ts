import type { MarketResearch } from "../types";

export const marketResearchKeys = {
  all: ["marketResearch"] as const,
  lists: () => [...marketResearchKeys.all, "list"] as const,
  list: () => [...marketResearchKeys.lists()] as const,
  detail: (id: string) => [...marketResearchKeys.all, "detail", id] as const,
};
