import React from "react";
import {
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaBriefcase,
  FaTimesCircle,
} from "react-icons/fa"; // Іконки

import { JobStatus, UpworkJob } from "../../models";
import { Card } from "../../shared/ui";

interface JobStatsProps {
  jobs: UpworkJob[];
}

const statusIcons: { [key in JobStatus]: JSX.Element } = {
  draft: <FaEdit className="text-text-muted" />,
  submitted: <FaBriefcase className="text-action" />,
  interview: <FaClock className="text-warning" />,
  offerReceived: <FaBriefcase className="text-success" />,
  offerAccepted: <FaCheckCircle className="text-success" />,
  inProgress: <FaClock className="text-action" />,
  completed: <FaCheckCircle className="text-success" />,
  closed: <FaTimesCircle className="text-destructive" />,
  declined: <FaTimesCircle className="text-destructive" />,
  withdrawn: <FaTimesCircle className="text-text-muted" />,
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

  const uniqueCountries = Array.from(
    new Set(jobs.map((job) => job.country_code || "ZZ")),
  );

  const uniqueSkills = Array.from(
    new Set(jobs.flatMap((job) => job.skills)),
  );

  // Статистика по статусах
  const statusCounts = jobs.reduce(
    (acc: { [key in JobStatus]?: number }, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <Card className="p-card">
      <div className="space-y-card">
        <h3 className="text-heading text-text-primary">Job Statuses</h3>
        <div className="grid grid-cols-2 gap-component sm:grid-cols-3 lg:grid-cols-4">
          {Object.keys(statusCounts).map((status) => (
            <div
              key={status}
              className="flex items-center gap-control rounded-control bg-block-subtle p-component"
            >
              {statusIcons[status as JobStatus]} {/* Іконки статусів */}
              <div>
                <p className="text-ui capitalize text-text-primary">
                  {status}: {statusCounts[status as JobStatus]}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-component">
          <h2 className="text-heading text-text-primary">Overall Job Statistics</h2>
          <div className="grid grid-cols-2 gap-component">
            <div className="rounded-control bg-block-subtle p-component">
              <h3 className="text-label text-text-muted">Total Jobs</h3>
              <p className="mt-item text-data text-text-primary">{totalJobs}</p>
            </div>
            <div className="rounded-control bg-block-subtle p-component">
              <h3 className="text-label text-text-muted">Average Rate</h3>
              <p className="mt-item text-data text-text-primary">${averageRate}</p>
            </div>
            <div className="rounded-control bg-block-subtle p-component">
              <h3 className="text-label text-text-muted">Unique Countries</h3>
              <p className="mt-item text-data text-text-primary">{uniqueCountries.length}</p>
            </div>
            <div className="rounded-control bg-block-subtle p-component">
              <h3 className="text-label text-text-muted">Unique Skills</h3>
              <p className="mt-item text-data text-text-primary">{uniqueSkills.length}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default JobStats;
