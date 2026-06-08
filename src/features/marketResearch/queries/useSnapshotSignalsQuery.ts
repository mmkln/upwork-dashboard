import { useQuery } from "@tanstack/react-query";
import { fetchSnapshotSignals } from "../api/marketResearchApi";
import type { SnapshotSignalsQuery, SnapshotSignalsResponse } from "../types";
import { marketResearchKeys } from "./keys";

export const useSnapshotSignalsQuery = (
  researchId: string | null,
  query: SnapshotSignalsQuery | null,
) => {
  return useQuery<SnapshotSignalsResponse>({
    queryKey:
      researchId && query
        ? marketResearchKeys.snapshotSignals(researchId, query)
        : [...marketResearchKeys.all, "snapshotSignals", "disabled"],
    queryFn: ({ signal }) => fetchSnapshotSignals(researchId!, query!, { signal }),
    enabled: Boolean(researchId && query?.snapshot_id),
    staleTime: 30_000,
  });
};
