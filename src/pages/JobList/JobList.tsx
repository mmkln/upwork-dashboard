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

  return (
    <>
      <div className="p-6">
        <Filters
          onFilterChange={onFilterChanged}
          availableSkills={availableSkills}
        />
      </div>
      <div className="px-6">
        <p className="text-lg font-medium text-gray-800">
          {filteredJobsData.length} job
          {filteredJobsData.length !== 1 ? "s" : ""} found
        </p>
      </div>
      <div className="flex flex-wrap gap-6 p-6">
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
