import React from "react";
import {
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaBriefcase,
  FaTimesCircle,
} from "react-icons/fa"; // Іконки

import { JobStatus, UpworkJob } from "../models";

interface JobStatsProps {
  jobs: UpworkJob[];
}

const statusIcons: { [key in JobStatus]: JSX.Element } = {
  draft: <FaEdit className="text-gray-500" />,
  submitted: <FaBriefcase className="text-blue-500" />,
  interview: <FaClock className="text-yellow-500" />,
  offerReceived: <FaBriefcase className="text-green-500" />,
  offerAccepted: <FaCheckCircle className="text-green-500" />,
  inProgress: <FaClock className="text-blue-500" />,
  completed: <FaCheckCircle className="text-green-600" />,
  closed: <FaTimesCircle className="text-red-500" />,
  declined: <FaTimesCircle className="text-red-600" />,
  withdrawn: <FaTimesCircle className="text-gray-400" />,
};

const JobStats: React.FC<JobStatsProps> = ({ jobs }) => {
  // Загальна кількість задач
  const totalJobs = jobs.length;

  // Підраховуємо загальний дохід і кількість завдань із ставками
  let rateSum = 0;
  let rateCount = 0;

  jobs.forEach((job) => {
    if (job.hourly_rates && job.hourly_rates.length > 0) {
      const avgHourlyRate =
        job.hourly_rates.reduce((sum, rate) => sum + rate, 0) /
        job.hourly_rates.length;
      rateSum += avgHourlyRate;
      rateCount += 1;
    } else if (job.fixed_price !== null) {
      // rateSum += job.fixed_price;
      // rateCount += 1;
    }
  });

  // Обчислюємо середню ставку

  const averageRate = rateCount > 0 ? (rateSum / rateCount).toFixed(2) : "N/A";

  // Загальна сума витрат клієнтів
  const totalSpent = jobs.reduce((acc, job) => {
    return acc + (job.total_spent ? Number(job.total_spent) : 0);
  }, 0);

  const uniqueCountries = jobs.reduce((list: string[], job) => {
    if (job.country && !list.includes(job.country)) list.push(job.country);
    return list;
  }, []);

  // Кількість унікальних навичок
  const uniqueSkills = Array.from(
    new Set(jobs.flatMap((job) => job.skills)),
  ).length;

  // Статистика по статусах
  const statusCounts = jobs.reduce(
    (acc: { [key in JobStatus]?: number }, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <div className="bg-white p-10 rounded-3xl shadow w-full">
      <div className="">
        <h3 className="text-xl font-medium mb-4">Job Statuses</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.keys(statusCounts).map((status) => (
            <div
              key={status}
              className="flex items-center bg-gray-100 p-4 rounded-lg shadow-md"
            >
              {statusIcons[status as JobStatus]} {/* Іконки статусів */}
              <div className="ml-4">
                <p className="text-lg font-medium capitalize">
                  {status}: {statusCounts[status as JobStatus]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-medium mb-4">Overall Job Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-medium">Total Jobs</h3>
            <p className="text-2xl">{totalJobs}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-medium">Average Rate</h3>
            <p className="text-2xl">${averageRate}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-medium">Unique Countries</h3>
            <p className="text-2xl">{uniqueCountries.length}</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-medium">Unique Skills</h3>
            <p className="text-2xl">{uniqueSkills}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobStats;
