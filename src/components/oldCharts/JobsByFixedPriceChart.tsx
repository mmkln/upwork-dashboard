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
type FixedPriceCategories = {
  "0-50": number;
  "51-100": number;
  "101-250": number;
  "251-500": number;
  "501-1000": number;
  "1001-2000": number;
  "2001-5000": number;
  "5001+": number;
};

interface JobsByFixedPriceChartProps {
  jobs: UpworkJob[];
}

const JobsByFixedPriceChart: React.FC<JobsByFixedPriceChartProps> = ({
  jobs,
}) => {
  // Групуємо роботи за категоріями фіксованої ціни
  const priceCategories: FixedPriceCategories = {
    "0-50": 0,
    "51-100": 0,
    "101-250": 0,
    "251-500": 0,
    "501-1000": 0,
    "1001-2000": 0,
    "2001-5000": 0,
    "5001+": 0,
  };

  jobs.forEach((job) => {
    if (job.fixed_price !== null) {
      if (job.fixed_price <= 50) {
        priceCategories["0-50"] += 1;
      } else if (job.fixed_price <= 100) {
        priceCategories["51-100"] += 1;
      } else if (job.fixed_price <= 250) {
        priceCategories["101-250"] += 1;
      } else if (job.fixed_price <= 500) {
        priceCategories["251-500"] += 1;
      } else if (job.fixed_price <= 1000) {
        priceCategories["501-1000"] += 1;
      } else if (job.fixed_price <= 2000) {
        priceCategories["1001-2000"] += 1;
      } else if (job.fixed_price <= 5000) {
        priceCategories["2001-5000"] += 1;
      } else {
        priceCategories["5001+"] += 1;
      }
    }
  });

  // Формуємо дані для BarChart
  const data = Object.keys(priceCategories).map((range) => ({
    range,
    count: priceCategories[range as keyof FixedPriceCategories],
  }));

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-4">Jobs by Fixed Price</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip formatter={(value) => `${value} jobs`} />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default JobsByFixedPriceChart;
