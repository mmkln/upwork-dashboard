// components/JobStatusSelect.tsx

import React from "react";
import { JobStatus } from "../../models";
import {
  RadixSelect as Select,
  RadixSelectContent as SelectContent,
  RadixSelectItem as SelectItem,
  RadixSelectTrigger as SelectTrigger,
  RadixSelectValue as SelectValue,
} from "../../shared/ui";
import { cn } from "lib/utils";

interface JobStatusSelectProps {
  status: JobStatus;
  onStatusChange: (newStatus: JobStatus) => void;
}

const getStatusColor = (status: JobStatus): string => {
  switch (status) {
    case JobStatus.Draft:
      return "bg-fill-secondary text-text-secondary";
    case JobStatus.Submitted:
      return "bg-action-muted text-action";
    case JobStatus.Interview:
      return "bg-warning-muted text-warning";
    case JobStatus.OfferReceived:
      return "bg-success-muted text-success";
    case JobStatus.OfferAccepted:
      return "bg-action-muted text-action";
    case JobStatus.InProgress:
      return "bg-action-muted text-action";
    case JobStatus.Completed:
      return "bg-success-muted text-success";
    case JobStatus.Closed:
      return "bg-destructive-muted text-destructive";
    case JobStatus.Declined:
      return "bg-destructive-muted text-destructive";
    case JobStatus.Withdrawn:
      return "bg-warning-muted text-warning";
    default:
      return "bg-fill-secondary text-text-primary";
  }
};

const statusLabels: { [key in JobStatus]: string } = {
  [JobStatus.Draft]: "Opportunity",
  [JobStatus.Submitted]: "Submitted",
  [JobStatus.Interview]: "Interview",
  [JobStatus.OfferReceived]: "Offer Received",
  [JobStatus.OfferAccepted]: "Offer Accepted",
  [JobStatus.InProgress]: "In Progress",
  [JobStatus.Completed]: "Completed",
  [JobStatus.Closed]: "Closed",
  [JobStatus.Declined]: "Declined",
  [JobStatus.Withdrawn]: "Withdrawn",
};

const JobStatusSelect: React.FC<JobStatusSelectProps> = ({
  status,
  onStatusChange,
}) => {
  return (
    <div
      className="min-w-status-trigger"
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <Select
        value={status}
        onValueChange={(value) => onStatusChange(value as JobStatus)}
      >
        <SelectTrigger
          id="job-status"
          className={cn(
            "h-control-small rounded-full border-transparent px-control text-ui shadow-none focus:ring-2 focus:ring-ring",
            getStatusColor(status),
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end" className="min-w-status-menu">
          {Object.values(JobStatus).map((statusValue) => (
            <SelectItem key={statusValue} value={statusValue}>
              {statusLabels[statusValue]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default JobStatusSelect;
