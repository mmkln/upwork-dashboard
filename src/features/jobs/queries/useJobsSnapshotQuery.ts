import { useQuery } from "@tanstack/react-query";
import type { FilterState } from "../../filters/types";
import { DEFAULT_FILTERS } from "../../filters/types";
import { fetchUpworkJobs } from "../../../services";
import { prepareJobs } from "../../../utils";
import { mapFiltersToJobQuery } from "../api/jobQueryParams";
import { jobKeys } from "./keys";
import type { PreparedUpworkJob } from "../../../models";
import { queryClient } from "../../../lib/queryClient";

type UseJobsSnapshotQueryParams = {
  filters?: FilterState;
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 2000;

/**
 * Clean TanStack Query version of the jobs snapshot loader.
 *
 * - Uses structured queryKey for perfect caching and invalidation.
 * - Automatically receives AbortSignal and cancels on unmount / key change.
 * - Replaces the old custom external store + manual loading for new consumers.
 *
 * Returns a list of prepared jobs + standard query states.
 * For progressive loading (page by page), we can enhance later with queryClient.setQueryData
 * or switch to useInfiniteQuery.
 */
export interface JobsSnapshotData {
  jobs: PreparedUpworkJob[];
  totalCount: number | null;
}

export const useJobsSnapshotQuery = ({
  filters,
  pageSize = DEFAULT_PAGE_SIZE,
}: UseJobsSnapshotQueryParams = {}) => {
  const query = mapFiltersToJobQuery(filters ?? DEFAULT_FILTERS);

  return useQuery<JobsSnapshotData>({
    queryKey: jobKeys.snapshot({ query, pageSize }),
    queryFn: async ({ signal }) => {
      let page = 1;
      let hasNext = true;
      const jobs: PreparedUpworkJob[] = [];
      let totalCount: number | null = null;

      const currentKey = jobKeys.snapshot({ query, pageSize });

      while (hasNext) {
        if (signal?.aborted) {
          break;
        }

        const pageResult = await fetchUpworkJobs(
          {
            page,
            page_size: pageSize,
            ...query,
          },
          { signal },
        );

        if (signal?.aborted) {
          break;
        }

        if (totalCount === null) {
          totalCount = pageResult.count ?? null;
        }

        jobs.push(...prepareJobs(pageResult.results));

        // Progressive update: push partial results into the cache so
        // consumers (and the progress bar) see data arrive page-by-page.
        queryClient.setQueryData<JobsSnapshotData>(currentKey, {
          jobs: [...jobs],
          totalCount,
        });

        hasNext = !!pageResult.next;
        page += 1;
      }

      // Final return (will be the same as last setQueryData)
      return { jobs, totalCount };
    },
    // Snapshots are expensive — keep data around longer
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};
