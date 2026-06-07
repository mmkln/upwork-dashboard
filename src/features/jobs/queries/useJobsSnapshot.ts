import { useCallback } from "react";
import type { FilterState } from "../../filters/types";
import { useJobsSnapshotQuery } from "./useJobsSnapshotQuery";

type UseJobsSnapshotParams = {
  filters?: FilterState;
  pageSize?: number;
};

/**
 * Primary hook for large jobs snapshots.
 * Backed by TanStack Query for caching, automatic cancellation on unmount/navigation,
 * and correct loading states.
 */
export const useJobsSnapshot = ({
  filters,
  pageSize = 2000,
}: UseJobsSnapshotParams = {}) => {
  const query = useJobsSnapshotQuery({ filters, pageSize });

  const reload = useCallback(() => {
    void query.refetch();
  }, [query]);

  const data = query.data;

  return {
    jobs: data?.jobs ?? [],
    loadedCount: data?.jobs?.length ?? 0,
    totalCount: data?.totalCount ?? 0,
    isHydrating: query.isLoading,
    isReady: query.isSuccess,
    isLoading: query.isLoading || query.isFetching,
    error: query.error,
    reload,
    // Raw query for power users (refetch, isFetching, etc.)
    query,
  };
};
