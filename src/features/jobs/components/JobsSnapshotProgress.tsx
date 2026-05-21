import React from "react";
import { Card } from "../../../shared/ui";

type JobsSnapshotProgressProps = {
  loadedCount: number;
  totalCount: number | null;
  isHydrating: boolean;
  isReady: boolean;
  error?: unknown;
  label?: string;
};

const formatCount = (value: number | null) =>
  value == null ? "unknown" : value.toLocaleString();

const JobsSnapshotProgress: React.FC<JobsSnapshotProgressProps> = ({
  loadedCount,
  totalCount,
  isHydrating,
  isReady,
  error,
  label = "Loading job snapshot",
}) => {
  if (!isHydrating && isReady && !error) {
    return null;
  }

  const progress =
    totalCount && totalCount > 0
      ? Math.min(100, Math.round((loadedCount / totalCount) * 100))
      : loadedCount > 0
        ? 35
        : 8;

  return (
    <Card className="p-component">
      <div className="flex flex-col gap-control">
        <div className="flex flex-wrap items-center justify-between gap-control">
          <div>
            <p className="text-ui text-text-primary">
              {error ? "Job snapshot unavailable" : label}
            </p>
            <p className="mt-micro text-body text-text-secondary">
              {error
                ? "The current view is using the data that is already available."
                : `${loadedCount.toLocaleString()} of ${formatCount(totalCount)} jobs loaded`}
            </p>
          </div>
          {!error ? (
            <span className="text-label text-text-muted">{progress}%</span>
          ) : null}
        </div>
        {!error ? (
          <div className="h-2 overflow-hidden rounded-full bg-fill-secondary">
            <div
              className="h-full rounded-full bg-action transition-[width] duration-motion-slow ease-motion-standard"
              style={{ width: `${progress}%` }}
            />
          </div>
        ) : null}
      </div>
    </Card>
  );
};

export default JobsSnapshotProgress;
