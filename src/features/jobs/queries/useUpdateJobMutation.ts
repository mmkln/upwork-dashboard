import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { JobStatus } from "../../../models";
import { updateUpworkJob } from "../../../services";
import { jobKeys } from "../queryKeys";
import type { JobsSnapshotData } from "./useJobsSnapshotQuery";
import type { PreparedUpworkJob, UpworkJob } from "../../../models";
import { prepareJobs } from "../../../utils";

/**
 * TanStack Query mutation for updating a job (status, bookmark, collections).
 *
 * On success:
 * - Updates the TanStack Query cache for all jobs snapshot queries (so UI using useJobsSnapshotQuery updates immediately).
 * All updates are done exclusively via TanStack Query cache (no legacy store).
 */
export const useUpdateJobMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobData: Partial<UpworkJob>) => updateUpworkJob(jobData),

    onSuccess: (updatedJob: UpworkJob) => {
      const [preparedJob] = prepareJobs([updatedJob]);

      // Update all snapshot queries in TanStack Query cache.
      // This is the primary mechanism now.
      // Any UI using useJobsSnapshot / useJobsSnapshotQuery will react immediately.
      queryClient.setQueriesData<JobsSnapshotData>(
        { queryKey: jobKeys.all },
        (oldData: JobsSnapshotData | undefined) => {
          if (!oldData || !oldData.jobs) return oldData;

          const updatedJobs = oldData.jobs.map((job: PreparedUpworkJob) =>
            job.id === preparedJob.id ? preparedJob : job,
          );

          return {
            ...oldData,
            jobs: updatedJobs,
          };
        },
      );

      // Updates go exclusively through the TanStack Query cache.
      // (useJobsPage maintains its own local paginated list state separately if needed.)
    },
  });
};

// Legacy simple function API - kept for any remaining direct calls during transition.
// Strongly prefer using `useUpdateJobMutation` hook in components for proper cache updates.
// These are thin wrappers. The hook performs the actual cache updates.
export const updateJobStatus = (jobId: string, status: JobStatus) =>
  updateUpworkJob({ id: jobId, status });

export const updateJobBookmark = (jobId: string, isBookmarked: boolean) =>
  updateUpworkJob({ id: jobId, is_bookmarked: isBookmarked });

export const updateJobCollections = (jobId: string, collectionIds: number[]) =>
  updateUpworkJob({ id: jobId, collections: collectionIds });
