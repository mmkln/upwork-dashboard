import React, { useState } from "react";
import Modal from "react-modal";
import { JobStatus, UpworkJob } from "../models";
import { JobStatusSelect } from ".";
import { updateUpworkJob } from "../services";

interface JobDetailsProps {
  job: UpworkJob;
  isOpen: boolean;
  onClose: () => void;
}

const JobDetails: React.FC<JobDetailsProps> = ({ job, isOpen, onClose }) => {
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
        <div className="flex gap-4 mb-4 items-center">
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
              Connects: {job.connects.toFixed(0)}
            </p>
          )}
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
