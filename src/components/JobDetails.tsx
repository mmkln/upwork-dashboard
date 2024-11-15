import React, { useState } from "react";
import Modal from "react-modal";

import { UpworkJob } from "../models";

interface JobDetailsProps {
  job: UpworkJob;
  isOpen: boolean;
  onClose: () => void;
}

const JobDetails: React.FC<JobDetailsProps> = ({ job, isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Job Details"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <div className="p-6">
        <button onClick={onClose} className="float-right text-gray-500">
          &times;
        </button>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          {job.title}
        </h2>
        <p className="text-sm text-gray-600 mb-2">
          Posted on: {new Date(job.created_at).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Experience Level: {job.experience}
        </p>
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
      </div>
    </Modal>
  );
};

export default JobDetails;
