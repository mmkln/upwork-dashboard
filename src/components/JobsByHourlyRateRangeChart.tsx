import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { UpworkJob } from "../models";

interface JobsByHourlyRateRangeChartProps {
  jobs: UpworkJob[];
}

// TODO: update component chart - currently useless
const JobsByHourlyRateRangeChart: React.FC<JobsByHourlyRateRangeChartProps> = ({
  jobs,
}) => {
  // Групуємо роботи за мінімальною, середньою та максимальною ставкою
  const rateData = jobs
    .filter((job) => job.hourly_rates && job.hourly_rates.length > 0)
    .map((job) => {
      const minRate = Math.min(...job.hourly_rates!);
      const maxRate = Math.max(...job.hourly_rates!);
      const avgRate =
        job.hourly_rates!.reduce((sum, rate) => sum + rate, 0) /
        job.hourly_rates!.length;

      return {
        title: job.title, // Можна замінити на job.id, якщо title занадто довгі
        minRate,
        avgRate,
        maxRate,
      };
    });

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-4">Hourly Rate Range for Jobs</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={rateData}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="title" angle={-45} textAnchor="end" interval={0} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="minRate"
            stroke="#82ca9d"
            name="Min Rate"
          />
          <Line
            type="monotone"
            dataKey="avgRate"
            stroke="#8884d8"
            name="Avg Rate"
          />
          <Line
            type="monotone"
            dataKey="maxRate"
            stroke="#ff8042"
            name="Max Rate"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default JobsByHourlyRateRangeChart;
