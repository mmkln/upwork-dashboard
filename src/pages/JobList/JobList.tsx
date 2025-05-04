// src/components/JobList.tsx
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { UpworkJob, JobStatus, JobExperience } from "../../models";
import { fetchUpworkJobs } from "../../services";
import { JobDetails } from "../../components";
import { filterJobs, JobType } from "../../features";
import { JobListItem } from "./components";
import { instruments } from "../../utils";
import FiltersPanel from "../../features/jobs/components/FiltersPanel";
import CopyExportControls from "../../features/jobs/components/CopyExportControls";

Modal.setAppElement("#root");

const JobList: React.FC = () => {
  const [jobsData, setJobsData] = useState<UpworkJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedJob, setSelectedJob] = useState<UpworkJob | null>(null);
  const [filteredJobsData, setFilteredJobsData] = useState<UpworkJob[]>([]);
  const availableStatuses = Object.values(JobStatus);
  const availableInstruments: string[] = instruments.map((toolEntry) =>
    Array.isArray(toolEntry) ? toolEntry[0] : toolEntry,
  );

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const fetchedJobs = await fetchUpworkJobs();
        const sortedJobs = sortJobs(fetchedJobs);
        setJobsData(sortedJobs);
        setFilteredJobsData(sortedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const sortJobs = (jobs: UpworkJob[]): UpworkJob[] => {
    return jobs.reverse();
  };

  const openJobDetails = (job: UpworkJob) => {
    setSelectedJob(job);
  };

  const closeJobDetails = () => {
    setSelectedJob(null);
  };

  // Отримуємо унікальний список скілів із jobsData
  const availableSkills = Array.from(
    new Set(jobsData.flatMap((job) => job.skills)),
  );

  if (loading) {
    return <p>Loading...</p>;
  }

  const onFilterChanged = (
    jobType: JobType,
    fixedPriceRange: [number, number] | null,
    hourlyRateRange: [number, number] | null,
    selectedSkills: string[],
    selectedInstruments: string[],
    selectedStatuses: JobStatus[],
    selectedExperience: JobExperience[],
  ) => {
    console.log({ jobType, fixedPriceRange, hourlyRateRange, selectedSkills });
    const jobs = filterJobs(
      jobsData,
      jobType,
      fixedPriceRange,
      hourlyRateRange,
      selectedSkills,
      selectedInstruments,
      selectedStatuses,
      selectedExperience,
      null, // minClientRating not used here
    );
    setFilteredJobsData(jobs);
  };

  const handleCopy = () => {
    const jsonString = JSON.stringify(filteredJobsData, null, 2);
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
    const jsonString = JSON.stringify(filteredJobsData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "filtered_jobs.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="p-6">
        <FiltersPanel
          onFilterChange={onFilterChanged}
          availableSkills={availableSkills}
          availableInstruments={availableInstruments}
          availableStatuses={availableStatuses}
        />
      </div>
      <div className="flex items-center justify-between px-6">
        <p className="text-lg font-medium text-gray-800">
          {filteredJobsData.length} job
          {filteredJobsData.length !== 1 ? "s" : ""} found
        </p>
        <CopyExportControls
          count={filteredJobsData.length}
          onCopy={handleCopy}
          onDownload={handleDownload}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 pt-4">
        {filteredJobsData.map((job) => (
          <JobListItem key={job.id} job={job} onClick={openJobDetails} />
        ))}
        {selectedJob && (
          <JobDetails
            job={selectedJob}
            isOpen={true}
            onClose={closeJobDetails}
          />
        )}
      </div>
    </>
  );
};

export default JobList;
