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
import { UpworkJob } from "../models";

interface AverageRateByCountryChartProps {
  jobs: UpworkJob[];
}

const AverageRateByCountryChart: React.FC<AverageRateByCountryChartProps> = ({
  jobs,
}) => {
  // Групуємо роботи за країнами та обчислюємо середню ставку
  const countryData = jobs.reduce(
    (acc: { [key: string]: { totalRate: number; count: number } }, job) => {
      if (job.country && job.average_rate !== null) {
        if (!acc[job.country]) {
          acc[job.country] = { totalRate: Number(job.average_rate), count: 1 };
        } else {
          acc[job.country].totalRate += Number(job.average_rate);
          acc[job.country].count += 1;
        }
      }
      return acc;
    },
    {},
  );

  // Перетворюємо об'єкт у масив для використання в BarChart
  const data = Object.keys(countryData).map((country) => ({
    country,
    averageRate: countryData[country].totalRate / countryData[country].count,
  }));

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-4">Average Rate by Country</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="country"
            angle={-25}
            textAnchor="end"
            interval={0}
            height={50}
            style={{ fontSize: "10px", fontWeight: "bold", fill: "#333" }}
          />
          <YAxis />
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
          <Bar dataKey="averageRate" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AverageRateByCountryChart;
