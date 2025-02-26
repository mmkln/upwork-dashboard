// src/components/JobListItem.tsx

import React, { useState } from "react";
import { UpworkJob, JobExperience, JobStatus } from "../../../models";
import { updateUpworkJob } from "../../../services";
import { JobStatusSelect } from "../../../components";

interface JobListItemProps {
  job: UpworkJob;
  onClick: (job: UpworkJob) => void;
}

const JobListItem: React.FC<JobListItemProps> = ({ job, onClick }) => {
  const [jobData, setJobData] = useState<UpworkJob>(job);

  const handleStatusChange = (status: JobStatus) => {
    updateUpworkJob({ ...job, status })
      .then((updatedJob) => {
        setJobData(updatedJob);
      })
      .catch((error) => {
        console.error("Error updating job status:", error);
      });
  };

  return (
    <div
      className="bg-white shadow-md rounded-md p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => onClick(job)}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-blue-600">
          {job.experience === JobExperience.Entry
            ? "Entry Level"
            : job.experience === JobExperience.Intermediate
              ? "Intermediate"
              : "Expert"}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(job.created_at).toLocaleDateString()}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{job.title}</h3>
      <p className="text-sm text-gray-600 mb-2 truncate">{job.description}</p>
      {job.connects && (
        <p className="text-sm text-gray-600 mb-4 truncate">
          Connects: {parseInt(job.connects)}
        </p>
      )}
      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills.map((skill, index) => (
          <span
            key={index}
            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
          >
            {skill}
          </span>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800">
            $
            {job.hourly_rates && job.hourly_rates.length > 0
              ? job.hourly_rates[0]
              : job.fixed_price}
          </span>
          <span className="text-xs text-gray-500">
            {job.hourly_rates && job.hourly_rates.length > 0
              ? "/ hr"
              : " (fixed)"}
          </span>
        </div>

        <JobStatusSelect
          status={jobData.status}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
};

export default JobListItem;
