import { useCallback, useState } from "react";
import type { PreparedUpworkJob, UpworkJob } from "../../../models";
import { useToast } from "../../../shared/toast/ToastProvider";

interface UseBulkJobActionsOptions {
  jobsData: PreparedUpworkJob[];
  replaceJob: (job: UpworkJob) => PreparedUpworkJob;
  updateJobAsync: (jobData: Partial<UpworkJob>) => Promise<UpworkJob>;
  selectedIds: Set<string>;
  clearSelection: () => void;
  reselect: (ids: string[]) => void;
}

export function useBulkJobActions({
  jobsData,
  replaceJob,
  updateJobAsync,
  selectedIds,
  clearSelection,
  reselect,
}: UseBulkJobActionsOptions) {
  const toast = useToast();
  const [isRunning, setIsRunning] = useState(false);

  /**
   * Applies `patchFor(job)` to every selected job that needs it (per `needsPatch`),
   * optimistically, in parallel, then rolls back and keeps the failed ones selected.
   */
  const runBulkPatch = useCallback(
    async ({
      label,
      needsPatch,
      patchFor,
    }: {
      label: string;
      needsPatch: (job: PreparedUpworkJob) => boolean;
      patchFor: (job: PreparedUpworkJob) => Partial<UpworkJob>;
    }) => {
      const ids = Array.from(selectedIds);
      if (ids.length === 0 || isRunning) return;

      const jobsById = new Map(jobsData.map((job) => [job.id, job]));
      const targets = ids.map((id) => jobsById.get(id)).filter((job): job is PreparedUpworkJob => !!job && needsPatch(job));

      if (targets.length === 0) {
        clearSelection();
        return;
      }

      setIsRunning(true);
      const toastId = toast.show(`${label}: 0 / ${targets.length}…`, "loading");

      const previous = new Map(targets.map((job) => [job.id, job]));
      let completed = 0;

      const results = await Promise.allSettled(
        targets.map(async (job) => {
          const patch = patchFor(job);
          replaceJob({ ...job, ...patch });
          try {
            await updateJobAsync({ id: job.id, ...patch });
          } finally {
            completed += 1;
            toast.update(toastId, `${label}: ${completed} / ${targets.length}…`, "loading");
          }
        }),
      );

      const failed = targets.filter((_, index) => results[index].status === "rejected");
      failed.forEach((job) => {
        const original = previous.get(job.id);
        if (original) replaceJob(original);
      });

      if (failed.length > 0) {
        toast.update(
          toastId,
          `${label}: done for ${targets.length - failed.length} of ${targets.length}. ${failed.length} failed — kept selected so you can retry.`,
          "error",
        );
        clearSelection();
        reselect(failed.map((job) => job.id));
      } else {
        toast.update(toastId, `${label}: applied to ${targets.length} job${targets.length > 1 ? "s" : ""}.`, "success");
        clearSelection();
      }

      setIsRunning(false);
    },
    [selectedIds, isRunning, jobsData, toast, replaceJob, updateJobAsync, clearSelection, reselect],
  );

  const addToCollection = useCallback(
    (collectionId: number) =>
      runBulkPatch({
        label: "Add to collection",
        needsPatch: (job) => !(job.collections ?? []).includes(collectionId),
        patchFor: (job) => ({ collections: [...(job.collections ?? []), collectionId] }),
      }),
    [runBulkPatch],
  );

  const removeFromCollection = useCallback(
    (collectionId: number) =>
      runBulkPatch({
        label: "Remove from collection",
        needsPatch: (job) => (job.collections ?? []).includes(collectionId),
        patchFor: (job) => ({ collections: (job.collections ?? []).filter((id) => id !== collectionId) }),
      }),
    [runBulkPatch],
  );

  return { isRunning, addToCollection, removeFromCollection };
}
