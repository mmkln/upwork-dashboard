import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import type { FilterState } from "../../filters/types";
import { mapFiltersToJobQuery } from "../api/jobQueryParams";
import {
  createJobsSnapshotKey,
  getJobsSnapshot,
  loadJobsSnapshot,
  reloadJobsSnapshot,
  selectJobsFromSnapshot,
  subscribeJobsSnapshot,
} from "../store/jobsSnapshotStore";

type UseJobsSnapshotParams = {
  filters?: FilterState;
  pageSize?: number;
};

export const useJobsSnapshot = ({
  filters,
  pageSize = 2000,
}: UseJobsSnapshotParams = {}) => {
  const query = useMemo(
    () => (filters ? mapFiltersToJobQuery(filters) : {}),
    [filters],
  );
  const request = useMemo(() => ({ query, pageSize }), [pageSize, query]);
  const snapshotKey = useMemo(
    () => createJobsSnapshotKey(request),
    [request],
  );

  const snapshot = useSyncExternalStore(
    useCallback(
      (listener) => subscribeJobsSnapshot(snapshotKey, listener),
      [snapshotKey],
    ),
    useCallback(() => getJobsSnapshot(snapshotKey), [snapshotKey]),
    useCallback(() => getJobsSnapshot(snapshotKey), [snapshotKey]),
  );

  useEffect(() => {
    if (snapshot.status === "idle") {
      void loadJobsSnapshot(request);
    };
  }, [request, snapshot.status]);

  const reload = useCallback(() => {
    reloadJobsSnapshot(request);
  }, [request]);

  const jobs = useMemo(() => selectJobsFromSnapshot(snapshot), [snapshot]);

  return {
    jobs,
    loadedCount: snapshot.loadedCount,
    totalCount: snapshot.totalCount,
    isHydrating: snapshot.status === "loading",
    isReady: snapshot.status === "ready",
    isLoading: snapshot.status === "idle" || snapshot.status === "loading",
    error: snapshot.error,
    reload,
  };
};
