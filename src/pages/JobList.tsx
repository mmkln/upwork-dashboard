import React, { useEffect, useState } from "react";
import { UpworkJob, JobExperience, JobStatus } from "../models";
import { fetchUpworkJobs } from "../services";

const JobList: React.FC = () => {
  const [jobs, setJobs] = useState<UpworkJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const fetchedJobs = await fetchUpworkJobs();
        setJobs(fetchedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex flex-wrap gap-6 p-6">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="bg-white shadow-md rounded-md p-4 w-full sm:w-[48%] md:w-[31%] lg:w-[23%] hover:shadow-lg transition-shadow duration-200"
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
                ${job.hourly_rates ? job.hourly_rates[0] : job.fixed_price}
              </span>
              <span className="text-xs text-gray-500">
                {job.hourly_rates ? "/ hr" : " (fixed)"}
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {job.status === JobStatus.InProgress && "In Progress"}
              {job.status === JobStatus.Completed && "Completed"}
              {job.status === JobStatus.Closed && "Closed"}
              {/* Add more conditions for other statuses */}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobList;
