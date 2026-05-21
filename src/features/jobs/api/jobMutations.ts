import type { JobStatus } from "../../../models";
import { updateUpworkJob } from "../../../services";
import { replaceJobInSnapshots } from "../store/jobsSnapshotStore";

export const updateJobStatus = (jobId: string, status: JobStatus) =>
  updateUpworkJob({ id: jobId, status }).then((job) => {
    replaceJobInSnapshots(job);
    return job;
  });

export const updateJobBookmark = (jobId: string, isBookmarked: boolean) =>
  updateUpworkJob({ id: jobId, is_bookmarked: isBookmarked }).then((job) => {
    replaceJobInSnapshots(job);
    return job;
  });

export const updateJobCollections = (jobId: string, collectionIds: number[]) =>
  updateUpworkJob({ id: jobId, collections: collectionIds }).then((job) => {
    replaceJobInSnapshots(job);
    return job;
  });
