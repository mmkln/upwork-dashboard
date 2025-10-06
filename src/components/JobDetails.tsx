import React, { useState } from "react";
import Modal from "react-modal";
import { JobStatus, UpworkJob } from "../models";
import { JobStatusSelect } from ".";
import { updateUpworkJob } from "../services";

interface JobDetailsProps {
  job: UpworkJob;
  isOpen: boolean;
  onClose: () => void;
  onJobUpdate: (job: UpworkJob) => void;
}

const JobDetails: React.FC<JobDetailsProps> = ({ job, isOpen, onClose, onJobUpdate }) => {
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

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Job Details"
      className="modal-content"
      overlayClassName="modal-overlay"
      style={{
        content: {
          position: "fixed",
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "90%",
          maxHeight: "90%",
          overflowY: "auto",
        },
        overlay: {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          zIndex: 999,
        },
      }}
    >
      <div>
        <button
          onClick={onClose}
          className="float-right text-gray-500 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {job.title}
        </h2>
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4 items-center">
            <JobStatusSelect
              status={jobData.status}
              onStatusChange={handleStatusChange}
            />
            <p className="text-sm text-gray-600">{job.experience}</p>
            <p className="text-sm text-gray-600">
              {new Date(job.created_at).toLocaleDateString()}
            </p>
            {job.connects && (
              <p className="text-sm text-gray-600">
                Connects: {parseInt(job.connects)}
              </p>
            )}
          </div>
          <button
            className="p-1 rounded text-gray-500 hover:bg-gray-100 disabled:text-gray-200 disabled:bg-white"
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
                className="w-5 h-5"
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
                className="w-5 h-5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
            )}
          </button>
        </div>
        {/*<div className="mb-4">*/}
        {/*  <h3 className="text-lg font-semibold text-gray-800 mb-2">Status</h3>*/}
        {/*  <span*/}
        {/*    className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(*/}
        {/*      job.status,*/}
        {/*    )}`}*/}
        {/*  >*/}
        {/*    {statusLabels[job.status]}*/}
        {/*  </span>*/}
        {/*</div>*/}

        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Description
        </h3>
        <p className="text-sm text-gray-600 mb-4">{job.description}</p>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Skills Required
        </h3>
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
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800">
            ${job.hourly_rates ? job.hourly_rates[0] : job.fixed_price}
          </span>
          <span className="text-xs text-gray-500">
            {job.hourly_rates ? "/ hr" : " (fixed)"}
          </span>
        </div>
        {job.client_industry && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Client Industry
            </h3>
            <p className="text-sm text-gray-600">{job.client_industry}</p>
          </div>
        )}
        {job.total_spent !== null && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Client Total Spent
            </h3>
            <p className="text-sm text-gray-600">${job.total_spent}</p>
          </div>
        )}
        <div className="mt-6">
          <a
            href={`https://www.upwork.com/jobs/${job.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View Job on Upwork
          </a>
        </div>
      </div>
    </Modal>
  );
};

export default JobDetails;
