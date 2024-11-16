import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { UpworkJob, JobExperience, JobStatus } from "../models";
import { fetchUpworkJobs } from "../services";
import { JobDetails } from "../components";
import { filterJobs, Filters, JobType } from "../features";

Modal.setAppElement("#root"); // Налаштування react-modal для роботи з accessibility

const JobList: React.FC = () => {
  const [jobsData, setJobsData] = useState<UpworkJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedJob, setSelectedJob] = useState<UpworkJob | null>(null);
  const [filteredJobsData, setFilteredJobsData] = useState<UpworkJob[]>([]);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const fetchedJobs = await fetchUpworkJobs();
        setJobsData(fetchedJobs);
        setFilteredJobsData(fetchedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const openJobDetails = (job: UpworkJob) => {
    setSelectedJob(job);
  };

  const closeJobDetails = () => {
    setSelectedJob(null);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  const onFilterChanged = (
    jobType: JobType,
    fixedPriceRange: [number, number] | null,
    hourlyRateRange: [number, number] | null,
  ) => {
    console.log({ jobType, fixedPriceRange, hourlyRateRange });
    const jobs = filterJobs(
      jobsData,
      jobType,
      fixedPriceRange,
      hourlyRateRange,
    );
    setFilteredJobsData(jobs);
  };

  return (
    <>
      <div className="p-6">
        <Filters onFilterChange={onFilterChanged} />
      </div>
      <div className="px-6">
        <p className="text-lg font-medium text-gray-800">
          {filteredJobsData.length} job
          {filteredJobsData.length !== 1 ? "s" : ""} found
        </p>
      </div>
      <div className="flex flex-wrap gap-6 p-6">
        {filteredJobsData.map((job) => (
          <div
            key={job.id}
            className="bg-white shadow-md rounded-md p-4 w-full sm:w-[48%] md:w-[31%] lg:w-[23%] hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            onClick={() => openJobDetails(job)}
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
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {job.title}
            </h3>
            <p className="text-sm text-gray-600 mb-4 truncate">
              {job.description}
            </p>
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
              <span className="text-xs text-gray-400">
                {job.status === JobStatus.InProgress && "In Progress"}
                {job.status === JobStatus.Completed && "Completed"}
                {job.status === JobStatus.Closed && "Closed"}
                {job.status === JobStatus.Submitted && "Submitted"}
                {job.status === JobStatus.Interview && "Interview"}
                {job.status === JobStatus.OfferReceived && "Offer Received"}
                {job.status === JobStatus.OfferAccepted && "Offer Accepted"}
                {job.status === JobStatus.Draft && "Draft"}
                {job.status === JobStatus.Withdrawn && "Withdrawn"}
                {job.status === JobStatus.Declined && "Declined"}
              </span>
            </div>
          </div>
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
