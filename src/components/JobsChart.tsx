import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { JobExperience } from "../models";

interface Job {
  experience: string;
}

interface JobsChartProps {
  jobs: Job[];
}

const JobsChart: React.FC<JobsChartProps> = ({ jobs }) => {
  // Генеруємо статистику за рівнями досвіду
  const data = [
    {
      name: "Entry",
      jobs: jobs.filter((job) => job.experience === JobExperience.Entry).length,
    },
    {
      name: "Intermediate",
      jobs: jobs.filter((job) => job.experience === JobExperience.Intermediate)
        .length,
    },
    {
      name: "Expert",
      jobs: jobs.filter((job) => job.experience === JobExperience.Expert)
        .length,
    },
  ];

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-4">Jobs by Experience Level</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="jobs" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default JobsChart;
