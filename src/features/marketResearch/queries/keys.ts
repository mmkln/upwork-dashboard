export const marketResearchKeys = {
  all: ["marketResearch"] as const,
  lists: () => [...marketResearchKeys.all, "list"] as const,
  list: () => [...marketResearchKeys.lists()] as const,
  detail: (id: string) => [...marketResearchKeys.all, "detail", id] as const,
  snapshotSignals: (researchId: string, query: unknown) =>
    [...marketResearchKeys.detail(researchId), "snapshotSignals", query] as const,
};
