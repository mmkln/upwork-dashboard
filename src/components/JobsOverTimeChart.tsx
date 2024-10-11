import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { UpworkJob } from "../models";
import dayjs from "dayjs";

interface JobsOverTimeChartProps {
  jobs: UpworkJob[];
}

const JobsOverTimeChart: React.FC<JobsOverTimeChartProps> = ({ jobs }) => {
  // Групуємо роботи за місяцями створення
  const jobsByMonth = jobs.reduce((acc: { [key: string]: number }, job) => {
    const month = dayjs(job.created_at).format("YYYY-MM"); // Формат YYYY-MM (наприклад, 2024-10)
    if (!acc[month]) {
      acc[month] = 1;
    } else {
      acc[month] += 1;
    }
    return acc;
  }, {});

  // Перетворюємо об'єкт в масив для використання в LineChart
  const data = Object.keys(jobsByMonth).map((month) => ({
    month,
    jobs: jobsByMonth[month],
  }));

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-4">Jobs Created Over Time</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `${value} jobs`} />
          <Line type="monotone" dataKey="jobs" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default JobsOverTimeChart;
