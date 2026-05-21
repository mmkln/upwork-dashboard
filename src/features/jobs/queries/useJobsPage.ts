import { useCallback, useEffect, useMemo, useState } from "react";
import type { PreparedUpworkJob, UpworkJob } from "../../../models";
import { fetchUpworkJobs } from "../../../services";
import { prepareJobs } from "../../../utils";
import type { FilterState } from "../../filters/types";
import { mapFiltersToJobQuery } from "../api/jobQueryParams";
import { replaceJobInSnapshots } from "../store/jobsSnapshotStore";

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
    let cancelled = false;

    const loadJobs = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const paginatedJobs = await fetchUpworkJobs({
          page,
          page_size: pageSize,
          ...query,
        });

        if (cancelled) return;

        setJobs(sortJobsForPage(prepareJobs(paginatedJobs.results)));
        setTotalJobs(paginatedJobs.count);
      } catch (loadError) {
        if (cancelled) return;
        console.error("Error fetching jobs:", loadError);
        setJobs([]);
        setTotalJobs(0);
        setError(loadError);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, query]);

  const replaceJob = useCallback((job: UpworkJob) => {
    const [preparedJob] = prepareJobs([job]);
    replaceJobInSnapshots(job);
    setJobs((currentJobs) =>
      currentJobs.map((currentJob) =>
        currentJob.id === preparedJob.id ? preparedJob : currentJob,
      ),
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
