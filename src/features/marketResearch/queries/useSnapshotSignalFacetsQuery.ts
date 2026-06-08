import { useQuery } from "@tanstack/react-query";
import { fetchSnapshotSignalFacets } from "../api/marketResearchApi";
import type {
  SnapshotSignalFacetsResponse,
  SnapshotSignalsQuery,
} from "../types";
import { marketResearchKeys } from "./keys";

export const useSnapshotSignalFacetsQuery = (
  researchId: string | null,
  query: SnapshotSignalsQuery | null,
) => {
  return useQuery<SnapshotSignalFacetsResponse>({
    queryKey:
      researchId && query
        ? marketResearchKeys.snapshotSignalFacets(researchId, query)
        : [...marketResearchKeys.all, "snapshotSignalFacets", "disabled"],
    queryFn: ({ signal }) =>
      fetchSnapshotSignalFacets(researchId!, query!, { signal }),
    enabled: Boolean(researchId && query?.snapshot_id),
    staleTime: 30_000,
  });
};
