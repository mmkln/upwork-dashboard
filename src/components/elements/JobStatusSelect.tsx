// components/JobStatusSelect.tsx

import React from "react";
import { JobStatus } from "../../models";

interface JobStatusSelectProps {
  status: JobStatus;
  onStatusChange: (newStatus: JobStatus) => void;
}

const getStatusColor = (status: JobStatus): string => {
  switch (status) {
    case JobStatus.Draft:
      return "bg-gray-200 text-gray-700";
    case JobStatus.Submitted:
      return "bg-blue-200 text-blue-800";
    case JobStatus.Interview:
      return "bg-yellow-200 text-yellow-800";
    case JobStatus.OfferReceived:
      return "bg-green-200 text-green-800";
    case JobStatus.OfferAccepted:
      return "bg-indigo-200 text-indigo-800";
    case JobStatus.InProgress:
      return "bg-purple-200 text-purple-800";
    case JobStatus.Completed:
      return "bg-teal-200 text-teal-800";
    case JobStatus.Closed:
      return "bg-red-200 text-red-800";
    case JobStatus.Declined:
      return "bg-pink-200 text-pink-800";
    case JobStatus.Withdrawn:
      return "bg-orange-200 text-orange-800";
    default:
      return "bg-gray-200 text-gray-800";
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
    <div className="">
      {/*<label*/}
      {/*  htmlFor="job-status"*/}
      {/*  className="block text-lg font-semibold text-gray-800 mb-2"*/}
      {/*>*/}
      {/*  Status*/}
      {/*</label>*/}
      <select
        id="job-status"
        value={status}
        onClick={(event) => {
          event.stopPropagation();
        }}
        onChange={(e) => onStatusChange(e.target.value as JobStatus)}
        className={`block text-xs font-medium px-2 py-1 w-full p-2 rounded ${getStatusColor(status)} border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
      >
        {Object.values(JobStatus).map((statusValue) => (
          <option key={statusValue} value={statusValue}>
            {statusLabels[statusValue]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default JobStatusSelect;
