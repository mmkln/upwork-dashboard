// src/components/JobListItem.tsx

import React, { useEffect, useState } from "react";
import { UpworkJob, JobExperience, JobStatus } from "../../../models";
import { updateUpworkJob } from "../../../services";
import { JobStatusSelect } from "../../../components";
import Card from "../../../components/ui/Card";

interface JobListItemProps {
  job: UpworkJob;
  onClick: (job: UpworkJob) => void;
  onJobUpdate: (job: UpworkJob) => void;
  isLastClicked?: boolean;
  collectionNameById: Record<number, string>;
}

const JobListItem: React.FC<JobListItemProps> = ({ job, onClick, onJobUpdate, isLastClicked = false, collectionNameById }) => {
  const [jobData, setJobData] = useState<UpworkJob>(job);

  const handleStatusChange = (status: JobStatus) => {
    updateUpworkJob({ ...jobData, status })
      .then((updatedJob) => {
        setJobData(updatedJob);
        onJobUpdate(updatedJob);
      })
      .catch((error) => {
        console.error("Error updating job status:", error);
      });
  };

  const handleBookmark = () => {
    updateUpworkJob({ ...jobData, is_bookmarked: !jobData.is_bookmarked })
      .then((updatedJob) => {
        setJobData(updatedJob);
        onJobUpdate(updatedJob);
      })
      .catch((error) => {
        console.error("Error updating job bookmark:", error);
      });
  };

  useEffect(() => {
    setJobData(job);
  }, [job]);

  const collectionBadges = (jobData.collections ?? job.collections ?? []).map(
    (collectionId) => ({
      id: collectionId,
      name: collectionNameById[collectionId],
    }),
  ).filter((entry): entry is { id: number; name: string } => Boolean(entry.name));

  return (
    <Card shadow={true} isHighlighted={isLastClicked}>
      <div className="group p-4 cursor-pointer" onClick={() => onClick(job)}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-blue-600">
            {job.experience === JobExperience.Entry
              ? "Entry Level"
              : job.experience === JobExperience.Intermediate
                ? "Intermediate"
                : "Expert"}
          </span>
          <div className="flex items-center gap-2 h-5">
            <span className="text-xs text-gray-500">
              {new Date(job.created_at).toLocaleDateString()}
            </span>
            <button
              className={`p-1 rounded text-gray-500 hover:bg-gray-100 disabled:text-gray-200 disabled:bg-white ${
                jobData.is_bookmarked ? 'block' : 'hidden group-hover:block'
              }`}
              title={jobData.is_bookmarked ? "Remove from bookmarks" : "Bookmark job"}
              onClick={(event) => {
                event.stopPropagation();
                handleBookmark();
              }}
            >
              {jobData.is_bookmarked ? (
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path fill-rule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clip-rule="evenodd" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {job.title}
        </h3>
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
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
        {collectionBadges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {collectionBadges.map(({ id, name }) => (
              <span
                key={id}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100"
              >
                {name}
              </span>
            ))}
          </div>
        )}
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
    </Card>
  );
};

export default JobListItem;
