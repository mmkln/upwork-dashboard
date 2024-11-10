import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { JobExperience, UpworkJob } from "../../models";

interface HourlyRateChartProps {
  jobs: UpworkJob[];
}

const HourlyRateChart: React.FC<HourlyRateChartProps> = ({ jobs }) => {
  // Створюємо дані для графіку
  const hourlyRateData = [
    {
      experience: "Entry",
      avg_rate:
        jobs
          .filter(
            (job) => job.experience === JobExperience.Entry && job.average_rate,
          )
          .reduce((acc, job) => acc + Number(job.average_rate), 0) /
          jobs.filter(
            (job) => job.experience === JobExperience.Entry && job.average_rate,
          ).length || 0,
    },
    {
      experience: "Intermediate",
      avg_rate:
        jobs
          .filter(
            (job) =>
              job.experience === JobExperience.Intermediate && job.average_rate,
          )
          .reduce((acc, job) => acc + Number(job.average_rate), 0) /
          jobs.filter(
            (job) =>
              job.experience === JobExperience.Intermediate && job.average_rate,
          ).length || 0,
    },
    {
      experience: "Expert",
      avg_rate:
        jobs
          .filter(
            (job) =>
              job.experience === JobExperience.Expert && job.average_rate,
          )
          .reduce((acc, job) => acc + Number(job.average_rate), 0) /
          jobs.filter(
            (job) =>
              job.experience === JobExperience.Expert && job.average_rate,
          ).length || 0,
    },
  ];

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-4">
        Average Hourly Rate by Experience Level
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={hourlyRateData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="experience" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="avg_rate" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HourlyRateChart;
