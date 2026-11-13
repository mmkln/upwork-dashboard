import React from "react";
import { BriefcaseBusiness, Clock3 } from "lucide-react";
import { Card } from "../../../shared/ui";
import { formatRelativeTime } from "../../../shared/formatters";
import { formatLowerBoundCurrency } from "../formatters";
import type { AgencyListItem } from "../types";

type AgencyCardProps = {
  agency: AgencyListItem;
  onOpen: (recordId: string) => void;
};

type AgencyMetricProps = {
  label: string;
  value: React.ReactNode;
};

const AgencyMetric: React.FC<AgencyMetricProps> = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-label text-text-muted">{label}</p>
    <p className="mt-micro truncate text-ui tabular-nums text-text-primary">
      {value}
    </p>
  </div>
);

const AgencyCard: React.FC<AgencyCardProps> = ({ agency, onOpen }) => (
  <Card className="flex h-full min-h-[286px] flex-col p-0 transition-shadow duration-motion-fast ease-motion-standard hover:shadow-block">
    <button
      type="button"
      className="flex flex-1 flex-col gap-card rounded-block p-block text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      onClick={() => onOpen(agency.record_id)}
      aria-label={`View ${agency.name}`}
    >
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-component">
          <h2 className="line-clamp-1 min-w-0 text-ui text-text-primary">
            {agency.name}
          </h2>
          <span className="shrink-0 text-label tabular-nums text-text-secondary">
            {agency.job_success === null ? "—" : `${agency.job_success}% JSS`}
          </span>
        </div>
        <p className="mt-micro line-clamp-2 min-h-[40px] text-body text-text-secondary">
          {agency.tagline || "Upwork agency"}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-item rounded-control bg-block-subtle p-component">
        <AgencyMetric
          label="Earned"
          value={formatLowerBoundCurrency(
            agency.total_earned,
            agency.total_earned_is_lower_bound,
          )}
        />
        <AgencyMetric
          label="Jobs"
          value={
            <span className="flex items-center gap-micro">
              <BriefcaseBusiness className="h-4 w-4 shrink-0 text-text-muted" />
              {agency.total_jobs?.toLocaleString() ?? "—"}
            </span>
          }
        />
        <AgencyMetric
          label="Hours"
          value={
            <span className="flex items-center gap-micro">
              <Clock3 className="h-4 w-4 shrink-0 text-text-muted" />
              {agency.total_hours?.toLocaleString() ?? "—"}
            </span>
          }
        />
      </div>

      <p className="mt-auto text-label text-text-muted">
        Updated {formatRelativeTime(agency.updated_at)}
      </p>
    </button>
  </Card>
);

export default AgencyCard;
