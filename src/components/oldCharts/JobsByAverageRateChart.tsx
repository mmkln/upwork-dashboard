import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { UpworkJob } from "../../models";

// Оголошуємо тип для ключів об'єкта
type HourlyRateCategories = {
  "0-10": number;
  "11-20": number;
  "21-30": number;
  "31-50": number;
  "51-75": number;
  "76-100": number;
  "101-150": number;
  "151-200": number;
  "200+": number;
};

interface JobsByHourlyRateChartProps {
  jobs: UpworkJob[];
}

const JobsByHourlyRateChart: React.FC<JobsByHourlyRateChartProps> = ({
  jobs,
}) => {
  // Групуємо роботи за категоріями середньої погодинної ставки
  const rateCategories: HourlyRateCategories = {
    "0-10": 0,
    "11-20": 0,
    "21-30": 0,
    "31-50": 0,
    "51-75": 0,
    "76-100": 0,
    "101-150": 0,
    "151-200": 0,
    "200+": 0,
  };

  jobs.forEach((job) => {
    if (job.hourly_rates && job.hourly_rates.length > 0) {
      const avgHourlyRate =
        job.hourly_rates.reduce((sum, rate) => sum + rate, 0) /
        job.hourly_rates.length;

      if (avgHourlyRate <= 10) {
        rateCategories["0-10"] += 1;
      } else if (avgHourlyRate <= 20) {
        rateCategories["11-20"] += 1;
      } else if (avgHourlyRate <= 30) {
        rateCategories["21-30"] += 1;
      } else if (avgHourlyRate <= 50) {
        rateCategories["31-50"] += 1;
      } else if (avgHourlyRate <= 75) {
        rateCategories["51-75"] += 1;
      } else if (avgHourlyRate <= 100) {
        rateCategories["76-100"] += 1;
      } else if (avgHourlyRate <= 150) {
        rateCategories["101-150"] += 1;
      } else if (avgHourlyRate <= 200) {
        rateCategories["151-200"] += 1;
      } else {
        rateCategories["200+"] += 1;
      }
    }
  });

  // Формуємо дані для BarChart
  const data = Object.keys(rateCategories).map((range) => ({
    range,
    count: rateCategories[range as keyof HourlyRateCategories],
  }));

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-4">Jobs by Hourly Rate</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip formatter={(value) => `${value} jobs`} />
          <Bar dataKey="count" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default JobsByHourlyRateChart;
