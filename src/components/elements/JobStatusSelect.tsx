// components/JobStatusSelect.tsx

import React from "react";
import { JobStatus } from "../../models";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/shadcn/ui/select";
import { cn } from "lib/utils";

interface JobStatusSelectProps {
  status: JobStatus;
  onStatusChange: (newStatus: JobStatus) => void;
}

const getStatusColor = (status: JobStatus): string => {
  switch (status) {
    case JobStatus.Draft:
      return "bg-gray-100 text-gray-700";
    case JobStatus.Submitted:
      return "bg-blue-50 text-blue-700";
    case JobStatus.Interview:
      return "bg-yellow-50 text-yellow-700";
    case JobStatus.OfferReceived:
      return "bg-green-50 text-green-700";
    case JobStatus.OfferAccepted:
      return "bg-indigo-50 text-indigo-700";
    case JobStatus.InProgress:
      return "bg-purple-50 text-purple-700";
    case JobStatus.Completed:
      return "bg-teal-50 text-teal-700";
    case JobStatus.Closed:
      return "bg-red-50 text-red-700";
    case JobStatus.Declined:
      return "bg-pink-50 text-pink-700";
    case JobStatus.Withdrawn:
      return "bg-orange-50 text-orange-700";
    default:
      return "bg-gray-100 text-gray-800";
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
      className="min-w-[138px]"
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
            "h-8 rounded-full border-transparent px-3 text-xs font-medium shadow-none focus:ring-1 focus:ring-active-300",
            getStatusColor(status),
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end" className="min-w-[180px] rounded-xl">
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
