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
import { UpworkJob } from "../models";

interface CountryJobsChartProps {
  jobs: UpworkJob[];
}

const CountryJobsChart: React.FC<CountryJobsChartProps> = ({ jobs }) => {
  // Групуємо роботи за країнами
  const countryData = jobs.reduce(
    (acc: { country: string; jobs: number }[], job) => {
      const found = acc.find((item) => item.country === job.country);
      if (found) {
        found.jobs += 1;
      } else {
        acc.push({ country: job.country, jobs: 1 });
      }
      return acc;
    },
    [],
  );

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-4">Jobs by Country</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={countryData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="country"
            angle={-25}
            textAnchor="end"
            interval={0}
            height={40}
            style={{ fontSize: "10px", fontWeight: "bold", fill: "#333" }}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="jobs" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CountryJobsChart;
