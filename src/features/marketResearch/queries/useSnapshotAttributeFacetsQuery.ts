import { useQuery } from "@tanstack/react-query";
import { fetchSnapshotAttributeFacets } from "../api/marketResearchApi";
import type {
  SnapshotAttributeFacetsResponse,
  SnapshotSignalsQuery,
} from "../types";
import { marketResearchKeys } from "./keys";

export const useSnapshotAttributeFacetsQuery = (
  researchId: string | null,
  query: SnapshotSignalsQuery | null,
) => {
  return useQuery<SnapshotAttributeFacetsResponse>({
    queryKey:
      researchId && query
        ? marketResearchKeys.snapshotAttributeFacets(researchId, query)
        : [...marketResearchKeys.all, "snapshotAttributeFacets", "disabled"],
    queryFn: ({ signal }) =>
      fetchSnapshotAttributeFacets(researchId!, query!, { signal }),
    enabled: Boolean(researchId && query?.snapshot_id),
    staleTime: 30_000,
  });
};
