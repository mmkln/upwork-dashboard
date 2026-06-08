/**
 * Query key factories for Jobs-related data.
 * Using a structured factory makes invalidation, refetching, and
 * useIsFetching filters predictable and type-safe.
 */
export const jobKeys = {
  all: ["jobs"] as const,

  // Snapshot of a large set of jobs (used by Dashboard, JobList facets, Market Signals)
  snapshot: (params: {
    query?: Record<string, unknown>;
    pageSize?: number;
  }) => [...jobKeys.all, "snapshot", params] as const,

  // Paginated list view (JobList page)
  list: (params: Record<string, unknown>) =>
    [...jobKeys.all, "list", params] as const,

  // Facets / analytics derived from snapshot
  facets: (params: Record<string, unknown>) =>
    [...jobKeys.all, "facets", params] as const,
};
