import React from "react";
import { Badge, Card, EmptyState } from "../../../shared/ui";
import { getRelevanceTone } from "../filters";
import type { MarketSignalJob } from "../types";

type SignalJobsTableProps = {
  jobs: MarketSignalJob[];
  selectedJobId: string | null;
  isLoading: boolean;
  onSelectJob: (job: MarketSignalJob) => void;
};

const formatSkills = (skills: string[]) => {
  if (!skills.length) return "-";
  return skills.slice(0, 3).join(", ");
};

const SignalJobsTable: React.FC<SignalJobsTableProps> = ({
  jobs,
  selectedJobId,
  isLoading,
  onSelectJob,
}) => (
  <Card className="p-card">
    <div className="flex flex-wrap items-center justify-between gap-control">
      <div>
        <h2 className="text-heading text-text-primary">
          Signal jobs
        </h2>
      </div>
      <Badge tone="info">{jobs.length.toLocaleString()} visible</Badge>
    </div>

    {isLoading ? (
      <div className="mt-card">
        <EmptyState title="Loading market signals..." />
      </div>
    ) : jobs.length ? (
      <div className="mt-card overflow-x-auto">
        <table className="w-full min-w-table-lg border-separate border-spacing-y-2 text-left">
          <thead>
            <tr className="text-label text-text-muted">
              <th className="px-control py-item">Title</th>
              <th className="px-control py-item">Category</th>
              <th className="px-control py-item">Client type</th>
              <th className="px-control py-item">Buyer need</th>
              <th className="px-control py-item">Budget</th>
              <th className="px-control py-item">Urgency</th>
              <th className="px-control py-item">Skills</th>
              <th className="px-control py-item">Score</th>
              <th className="px-control py-item">Relevance</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const isSelected = selectedJobId === job.jobId;

              return (
                <tr
                  key={job.jobId}
                  className={
                    isSelected
                      ? "cursor-pointer bg-island-selected text-body"
                      : "cursor-pointer bg-block text-body hover:bg-fill-tertiary"
                  }
                  onClick={() => onSelectJob(job)}
                >
                  <td className="rounded-l-[10px] px-control py-control">
                    <p className="line-clamp-2 max-w-title text-ui text-text-primary">
                      {job.sourceJob.title}
                    </p>
                    <p className="mt-micro text-label text-text-muted">
                      {job.sourceJob.country || "Unknown country"}
                    </p>
                  </td>
                  <td className="px-control py-control text-text-secondary">
                    {job.requestCategory}
                  </td>
                  <td className="px-control py-control text-text-secondary">
                    {job.clientType}
                  </td>
                  <td className="px-control py-control text-text-secondary">
                    {job.buyerNeed}
                  </td>
                  <td className="px-control py-control text-text-secondary">
                    {job.budgetSignal}
                  </td>
                  <td className="px-control py-control text-text-secondary">
                    {job.urgencySignal}
                  </td>
                  <td className="px-control py-control text-text-secondary">
                    {formatSkills(job.requiredSkills)}
                  </td>
                  <td className="px-control py-control">
                    <Badge
                      tone={job.marketSignalScore >= 4 ? "success" : "neutral"}
                    >
                      {job.marketSignalScore.toFixed(1)}
                    </Badge>
                  </td>
                  <td className="rounded-r-[10px] px-control py-control">
                    <Badge tone={getRelevanceTone(job.relevanceStatus)}>
                      {job.relevanceStatus}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="mt-card">
        <EmptyState
          title="No signal jobs match these filters"
          description="Adjust the board query, keywords, or filters."
        />
      </div>
    )}
  </Card>
);

export default SignalJobsTable;
