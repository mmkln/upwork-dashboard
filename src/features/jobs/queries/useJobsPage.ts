import { useCallback, useEffect, useMemo, useState } from "react";
import type { PreparedUpworkJob, UpworkJob } from "../../../models";
import { fetchUpworkJobs } from "../../../services";
import { prepareJobs } from "../../../utils";
import type { FilterState } from "../../filters/types";
import { mapFiltersToJobQuery } from "../api/jobQueryParams";
import { queryClient } from "../../../lib/queryClient";
import { jobKeys } from "../queryKeys";
import type { JobsSnapshotData } from "./useJobsSnapshotQuery";

type UseJobsPageParams = {
  filters: FilterState;
  page: number;
  pageSize: number;
};

const sortJobsForPage = (jobs: PreparedUpworkJob[]) => [...jobs].reverse();

export const useJobsPage = ({
  filters,
  page,
  pageSize,
}: UseJobsPageParams) => {
  const [jobs, setJobs] = useState<PreparedUpworkJob[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const query = useMemo(() => mapFiltersToJobQuery(filters), [filters]);

  useEffect(() => {
    const controller = new AbortController();

    const loadJobs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const paginatedJobs = await fetchUpworkJobs(
          {
            page,
            page_size: pageSize,
            ...query,
          },
          { signal: controller.signal },
        );

        // If the component unmounted or deps changed, the signal will be aborted.
        // We still check for good measure.
        if (controller.signal.aborted) return;

        setJobs(sortJobsForPage(prepareJobs(paginatedJobs.results)));
        setTotalJobs(paginatedJobs.count);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        console.error("Error fetching jobs:", loadError);
        setJobs([]);
        setTotalJobs(0);
        setError(loadError);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadJobs();

    return () => {
      controller.abort();
    };
  }, [page, pageSize, query]);

  const replaceJob = useCallback((job: UpworkJob) => {
    const [preparedJob] = prepareJobs([job]);

    // Update local paginated list state
    setJobs((currentJobs) =>
      currentJobs.map((currentJob) =>
        currentJob.id === preparedJob.id ? preparedJob : currentJob,
      ),
    );

    // Also update any active snapshot queries in TanStack cache for consistency
    queryClient.setQueriesData<JobsSnapshotData>(
      { queryKey: jobKeys.all },
      (oldData: JobsSnapshotData | undefined) => {
        if (!oldData || !oldData.jobs) return oldData;
        return {
          ...oldData,
          jobs: oldData.jobs.map((j) =>
            j.id === preparedJob.id ? preparedJob : j,
          ),
        };
      },
    );

    return preparedJob;
  }, []);

  const totalPages = totalJobs > 0 ? Math.ceil(totalJobs / pageSize) : 1;

  return {
    jobs,
    totalJobs,
    totalPages,
    isLoading,
    error,
    replaceJob,
  };
};
