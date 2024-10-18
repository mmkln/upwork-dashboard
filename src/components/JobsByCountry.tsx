import React from "react";
import { UpworkJob } from "../models";
import { ValueByCategoryChart, CategoryValueItem } from "./charts";

interface JobsByCountryProps {
  jobs: UpworkJob[];
  limit?: number;
}

const roundToSignificant = (num: number): number => {
  if (num < 10) return 10; // Значення менше 10 округлюємо до 10
  const power = Math.pow(10, Math.floor(Math.log10(num)));
  return Math.ceil(num / power) * power; // Округлення до найближчого значного числа
};

const JobsByCountry: React.FC<JobsByCountryProps> = ({ jobs, limit }) => {
  const countryData = jobs.reduce(
    (acc: { [key: string]: { count: number } }, job) => {
      if (job.country) {
        if (!acc[job.country]) {
          acc[job.country] = { count: 1 };
        } else {
          acc[job.country].count += 1;
        }
      }
      return acc;
    },
    {},
  );

  console.log({ countryData });

  // Перетворюємо об'єкт у масив для використання в BarChart
  const data: CategoryValueItem[] = Object.keys(countryData).map((country) => ({
    label: country,
    value: countryData[country].count,
  }));

  const maxRate = roundToSignificant(
    Math.max(...data.map((item) => item.value)),
  );

  const sortedData = data.sort((a, b) => b.value - a.value);
  const limitedData = limit ? sortedData.slice(0, limit) : data;

  return (
    <div className="bg-white p-8 rounded-3xl shadow w-full">
      <h2 className="text-lg font-semibold mb-8">Jobs by Country</h2>

      <div className="overflow-scroll h-[21.5rem]">
        <ValueByCategoryChart
          data={limitedData}
          maxValue={maxRate}
          minValue={0}
        />
      </div>
    </div>
  );
};

export default JobsByCountry;
