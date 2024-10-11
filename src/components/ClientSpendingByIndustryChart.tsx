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

interface ClientSpendingByIndustryChartProps {
  jobs: UpworkJob[];
}

const ClientSpendingByIndustryChart: React.FC<
  ClientSpendingByIndustryChartProps
> = ({ jobs }) => {
  // Групуємо роботи за галузями клієнтів і підраховуємо загальні витрати
  const industryData = jobs.reduce((acc: { [key: string]: number }, job) => {
    if (job.client_industry && job.total_spent !== null) {
      if (!acc[job.client_industry]) {
        acc[job.client_industry] = Number(job.total_spent);
      } else {
        acc[job.client_industry] += Number(job.total_spent);
      }
    }
    return acc;
  }, {});

  // Перетворюємо об'єкт в масив для використання в BarChart
  const data = Object.keys(industryData).map((industry) => ({
    industry,
    totalSpent: industryData[industry],
  }));

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-4">
        Client Spending by Industry
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="industry"
            angle={-25}
            textAnchor="end"
            interval={0}
            height={80}
            style={{ fontSize: "10px", fontWeight: "bold", fill: "#333" }}
          />
          <YAxis />
          <Tooltip formatter={(value) => `$${value}`} />
          <Bar dataKey="totalSpent" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ClientSpendingByIndustryChart;
