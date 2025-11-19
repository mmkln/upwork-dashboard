import React from "react";
import { PreparedUpworkJob } from "../models";

interface JobExportActionsProps {
  jobs: PreparedUpworkJob[];
  filterDescriptor?: string;
  filenamePrefix?: string;
  className?: string;
}

const JobExportActions: React.FC<JobExportActionsProps> = ({
  jobs,
  filterDescriptor = "all",
  filenamePrefix = "filtered-jobs",
  className = "",
}) => {
  const hasJobs = jobs.length > 0;
  const normalizedDescriptor =
    (filterDescriptor || "all")
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9+_\-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^[-_]+|[-_]+$/g, "") || "all";

  const handleCopy = () => {
    const jsonString = JSON.stringify(jobs, null, 2);
    navigator.clipboard
      .writeText(jsonString)
      .then(() => {
        alert("Jobs copied to clipboard!");
      })
      .catch((err) => {
        console.error("Error while exporting", err);
        alert("Could not copy jobs to clipboard");
      });
  };

  const handleDownload = () => {
    const jsonString = JSON.stringify(jobs, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    const formattedDateTime = `${date}-${time}`
      .replace(/\//g, "-")
      .replace(/:/g, "-");
    a.href = url;
    a.download = `${filenamePrefix}-${normalizedDescriptor}-${formattedDateTime}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      <button
        className="p-2 rounded text-gray-500 hover:bg-gray-100 disabled:text-gray-200 disabled:bg-white"
        title="Copy jobs to clipboard"
        onClick={handleCopy}
        disabled={!hasJobs}
      >
        <svg
          className="w-6 h-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6"
          />
        </svg>
      </button>
      <button
        className="p-2 rounded text-gray-500 hover:bg-gray-100 disabled:text-gray-200 disabled:bg-white"
        title="Export jobs as JSON file"
        onClick={handleDownload}
        disabled={!hasJobs}
      >
        <svg
          className="w-6 h-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
          />
        </svg>
      </button>
    </div>
  );
};

export default JobExportActions;
