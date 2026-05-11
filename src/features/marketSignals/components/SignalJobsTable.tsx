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
  <Card className="p-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-text-primary">
          Signal jobs
        </h2>
        <p className="mt-1 text-xs text-text-muted">
          Classified jobs with extracted comparison fields.
        </p>
      </div>
      <Badge tone="info">{jobs.length.toLocaleString()} visible</Badge>
    </div>

    {isLoading ? (
      <div className="mt-5">
        <EmptyState title="Loading market signals..." />
      </div>
    ) : jobs.length ? (
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[1120px] border-separate border-spacing-y-2 text-left">
          <thead>
            <tr className="text-[11px] uppercase text-text-muted">
              <th className="px-3 py-2 font-medium">Title</th>
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">Client type</th>
              <th className="px-3 py-2 font-medium">Buyer need</th>
              <th className="px-3 py-2 font-medium">Budget</th>
              <th className="px-3 py-2 font-medium">Urgency</th>
              <th className="px-3 py-2 font-medium">Skills</th>
              <th className="px-3 py-2 font-medium">Score</th>
              <th className="px-3 py-2 font-medium">Relevance</th>
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
                      ? "cursor-pointer bg-accent text-sm"
                      : "cursor-pointer bg-surface-subtle text-sm hover:bg-accent"
                  }
                  onClick={() => onSelectJob(job)}
                >
                  <td className="rounded-l-[10px] px-3 py-3">
                    <p className="line-clamp-2 max-w-[300px] font-medium text-text-primary">
                      {job.sourceJob.title}
                    </p>
                    <p className="mt-1 text-[11px] text-text-muted">
                      {job.sourceJob.country || "Unknown country"}
                    </p>
                  </td>
                  <td className="px-3 py-3 text-text-secondary">
                    {job.requestCategory}
                  </td>
                  <td className="px-3 py-3 text-text-secondary">
                    {job.clientType}
                  </td>
                  <td className="px-3 py-3 text-text-secondary">
                    {job.buyerNeed}
                  </td>
                  <td className="px-3 py-3 text-text-secondary">
                    {job.budgetSignal}
                  </td>
                  <td className="px-3 py-3 text-text-secondary">
                    {job.urgencySignal}
                  </td>
                  <td className="px-3 py-3 text-text-secondary">
                    {formatSkills(job.requiredSkills)}
                  </td>
                  <td className="px-3 py-3">
                    <Badge
                      tone={job.marketSignalScore >= 4 ? "success" : "neutral"}
                    >
                      {job.marketSignalScore.toFixed(1)}
                    </Badge>
                  </td>
                  <td className="rounded-r-[10px] px-3 py-3">
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
      <div className="mt-5">
        <EmptyState
          title="No signal jobs match these filters"
          description="Adjust the board query, keywords, or filters."
        />
      </div>
    )}
  </Card>
);

export default SignalJobsTable;

