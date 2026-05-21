import React from "react";
import { Clipboard, Download } from "lucide-react";
import { PreparedUpworkJob } from "../models";
import { serializeJobsForExport } from "../features/jobs";
import { IconButton } from "../shared/ui";

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
    const jsonString = JSON.stringify(serializeJobsForExport(jobs), null, 2);
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
    const jsonString = JSON.stringify(serializeJobsForExport(jobs), null, 2);
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
    <div className={`flex gap-item ${className}`}>
      <IconButton
        variant="ghost"
        size="md"
        title="Copy jobs to clipboard"
        aria-label="Copy jobs to clipboard"
        onClick={handleCopy}
        disabled={!hasJobs}
      >
        <Clipboard className="h-4 w-4" />
      </IconButton>
      <IconButton
        variant="ghost"
        size="md"
        title="Export jobs as JSON file"
        aria-label="Export jobs as JSON file"
        onClick={handleDownload}
        disabled={!hasJobs}
      >
        <Download className="h-4 w-4" />
      </IconButton>
    </div>
  );
};

export default JobExportActions;
