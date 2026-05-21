import type { JobQueryParams } from "../../../services/apiService";
import { fetchUpworkJobs } from "../../../services";
import type { PreparedUpworkJob, UpworkJob } from "../../../models";
import { prepareJobs } from "../../../utils";

export type JobsSnapshotStatus = "idle" | "loading" | "ready" | "error";

export type JobsSnapshotRequest = {
  query?: Omit<JobQueryParams, "page" | "page_size">;
  pageSize?: number;
};

export type JobsSnapshotState = {
  key: string;
  byId: Record<string, PreparedUpworkJob>;
  ids: string[];
  loadedCount: number;
  totalCount: number | null;
  status: JobsSnapshotStatus;
  error: unknown;
  requestedAt: number | null;
  loadedAt: number | null;
};

type Listener = () => void;

const DEFAULT_PAGE_SIZE = 2000;
const snapshots = new Map<string, JobsSnapshotState>();
const listeners = new Map<string, Set<Listener>>();
const inFlightRequests = new Map<string, AbortController>();

const EMPTY_SNAPSHOT: JobsSnapshotState = {
  key: "empty",
  byId: {},
  ids: [],
  loadedCount: 0,
  totalCount: null,
  status: "idle",
  error: null,
  requestedAt: null,
  loadedAt: null,
};

const stableQueryEntries = (
  query: Omit<JobQueryParams, "page" | "page_size"> = {},
) =>
  Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== "")
    .sort(([left], [right]) => left.localeCompare(right));

export const createJobsSnapshotKey = ({
  query = {},
  pageSize = DEFAULT_PAGE_SIZE,
}: JobsSnapshotRequest = {}) =>
  JSON.stringify({
    pageSize,
    query: stableQueryEntries(query),
  });

export const getJobsSnapshot = (key: string): JobsSnapshotState =>
  snapshots.get(key) ?? EMPTY_SNAPSHOT;

const emitSnapshot = (key: string) => {
  listeners.get(key)?.forEach((listener) => listener());
};

const setSnapshot = (key: string, nextState: JobsSnapshotState) => {
  snapshots.set(key, nextState);
  emitSnapshot(key);
};

export const subscribeJobsSnapshot = (key: string, listener: Listener) => {
  const snapshotListeners = listeners.get(key) ?? new Set<Listener>();
  snapshotListeners.add(listener);
  listeners.set(key, snapshotListeners);

  return () => {
    snapshotListeners.delete(listener);
    if (snapshotListeners.size === 0) {
      listeners.delete(key);
    }
  };
};

const mergePreparedJobs = (
  current: Pick<JobsSnapshotState, "byId" | "ids">,
  jobs: PreparedUpworkJob[],
) => {
  const byId = { ...current.byId };
  const ids = [...current.ids];
  const idsSet = new Set(ids);

  jobs.forEach((job) => {
    byId[job.id] = job;
    if (!idsSet.has(job.id)) {
      idsSet.add(job.id);
      ids.push(job.id);
    }
  });

  return { byId, ids };
};

export const loadJobsSnapshot = async ({
  query = {},
  pageSize = DEFAULT_PAGE_SIZE,
}: JobsSnapshotRequest = {}) => {
  const key = createJobsSnapshotKey({ query, pageSize });
  const currentSnapshot = getJobsSnapshot(key);

  if (currentSnapshot.status === "loading") {
    return;
  }

  inFlightRequests.get(key)?.abort();
  const controller = new AbortController();
  inFlightRequests.set(key, controller);

  let nextSnapshot: JobsSnapshotState = {
    key,
    byId: {},
    ids: [],
    loadedCount: 0,
    totalCount: null,
    status: "loading",
    error: null,
    requestedAt: Date.now(),
    loadedAt: null,
  };
  setSnapshot(key, nextSnapshot);

  try {
    let page = 1;

    while (true) {
      if (controller.signal.aborted) return;

      const pageResult = await fetchUpworkJobs({
        page,
        page_size: pageSize,
        ...query,
      });

      if (controller.signal.aborted) return;

      const preparedJobs = prepareJobs(pageResult.results);
      const merged = mergePreparedJobs(nextSnapshot, preparedJobs);
      nextSnapshot = {
        ...nextSnapshot,
        ...merged,
        loadedCount: merged.ids.length,
        totalCount: pageResult.count,
      };
      setSnapshot(key, nextSnapshot);

      if (!pageResult.next) break;
      page += 1;
    }

    setSnapshot(key, {
      ...nextSnapshot,
      status: "ready",
      loadedAt: Date.now(),
    });
  } catch (error) {
    if (controller.signal.aborted) return;
    console.error("Error fetching jobs snapshot:", error);
    setSnapshot(key, {
      ...nextSnapshot,
      status: "error",
      error,
      loadedAt: Date.now(),
    });
  } finally {
    if (inFlightRequests.get(key) === controller) {
      inFlightRequests.delete(key);
    }
  }
};

export const reloadJobsSnapshot = (request: JobsSnapshotRequest = {}) => {
  const key = createJobsSnapshotKey(request);
  inFlightRequests.get(key)?.abort();
  snapshots.delete(key);
  emitSnapshot(key);
  void loadJobsSnapshot(request);
};

export const replaceJobInSnapshots = (job: UpworkJob) => {
  const [preparedJob] = prepareJobs([job]);

  snapshots.forEach((snapshot, key) => {
    if (!snapshot.byId[preparedJob.id]) return;
    setSnapshot(key, {
      ...snapshot,
      byId: {
        ...snapshot.byId,
        [preparedJob.id]: preparedJob,
      },
    });
  });

  return preparedJob;
};

export const selectJobsFromSnapshot = (snapshot: JobsSnapshotState) =>
  snapshot.ids.map((id) => snapshot.byId[id]).filter(Boolean);
