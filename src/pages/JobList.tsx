import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { UpworkJob, JobExperience, JobStatus } from "../models";
import { fetchUpworkJobs } from "../services";
import { JobDetails, JobStatusSelect } from "../components";
import { filterJobs, Filters, JobType } from "../features";

Modal.setAppElement("#root"); // Налаштування react-modal для роботи з accessibility

const getStatusColor = (status: JobStatus): string => {
  switch (status) {
    case JobStatus.Draft:
      return "bg-gray-200 text-gray-700";
    case JobStatus.Submitted:
      return "bg-blue-200 text-blue-800";
    case JobStatus.Interview:
      return "bg-yellow-200 text-yellow-800";
    case JobStatus.OfferReceived:
      return "bg-green-200 text-green-800";
    case JobStatus.OfferAccepted:
      return "bg-indigo-200 text-indigo-800";
    case JobStatus.InProgress:
      return "bg-purple-200 text-purple-800";
    case JobStatus.Completed:
      return "bg-teal-200 text-teal-800";
    case JobStatus.Closed:
      return "bg-red-200 text-red-800";
    case JobStatus.Declined:
      return "bg-pink-200 text-pink-800";
    case JobStatus.Withdrawn:
      return "bg-orange-200 text-orange-800";
    default:
      return "bg-gray-200 text-gray-800";
  }
};

const statusLabels: { [key in JobStatus]: string } = {
  [JobStatus.Draft]: "Opportunity",
  [JobStatus.Submitted]: "Submitted",
  [JobStatus.Interview]: "Interview",
  [JobStatus.OfferReceived]: "Offer Received",
  [JobStatus.OfferAccepted]: "Offer Accepted",
  [JobStatus.InProgress]: "In Progress",
  [JobStatus.Completed]: "Completed",
  [JobStatus.Closed]: "Closed",
  [JobStatus.Declined]: "Declined",
  [JobStatus.Withdrawn]: "Withdrawn",
};

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

              <JobStatusSelect status={job.status} onStatusChange={() => {}} />
              {/*<span*/}
              {/*  className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(*/}
              {/*    job.status,*/}
              {/*  )}`}*/}
              {/*>*/}
              {/*  {statusLabels[job.status]}*/}
              {/*</span>*/}
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
