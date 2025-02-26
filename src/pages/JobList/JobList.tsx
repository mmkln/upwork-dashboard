// src/components/JobList.tsx

import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { UpworkJob, JobStatus } from "../../models";
import { fetchUpworkJobs } from "../../services";
import { JobDetails } from "../../components";
import { filterJobs, Filters, JobType } from "../../features";
import { JobListItem } from "./components";

Modal.setAppElement("#root");

const JobList: React.FC = () => {
  const [jobsData, setJobsData] = useState<UpworkJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedJob, setSelectedJob] = useState<UpworkJob | null>(null);
  const [filteredJobsData, setFilteredJobsData] = useState<UpworkJob[]>([]);

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
  ) => {
    console.log({ jobType, fixedPriceRange, hourlyRateRange, selectedSkills });
    const jobs = filterJobs(
      jobsData,
      jobType,
      fixedPriceRange,
      hourlyRateRange,
      selectedSkills,
    );
    setFilteredJobsData(jobs);
  };

  const handleExport = () => {
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

  return (
    <>
      <div className="p-6">
        <Filters
          onFilterChange={onFilterChanged}
          availableSkills={availableSkills}
        />
      </div>
      <div className="flex items-center justify-between px-6">
        <p className="text-lg font-medium text-gray-800">
          {filteredJobsData.length} job
          {filteredJobsData.length !== 1 ? "s" : ""} found
        </p>
        <button
          className="p-2 rounded text-gray-500 hover:bg-gray-100  disabled:text-gray-200 disabled:bg-white"
          title="Copy jobs to clipboard"
          onClick={handleExport}
          disabled={filteredJobsData.length === 0}
        >
          <svg
            className="w-6 h-6 "
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6"
            />
          </svg>
        </button>
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
