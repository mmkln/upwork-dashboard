import React from "react";
import { UpworkJob } from "../models";
import { ValueByCategoryChart, CategoryValueItem } from "./charts";

interface AverageRateByCountryProps {
  jobs: UpworkJob[];
  limit?: number;
}

const roundToSignificant = (num: number): number => {
  if (num < 10) return 10; // Значення менше 10 округлюємо до 10
  const power = Math.pow(10, Math.floor(Math.log10(num)));
  return Math.ceil(num / power) * power; // Округлення до найближчого значного числа
};

const AverageRateByCountry: React.FC<AverageRateByCountryProps> = ({
  jobs,
  limit,
}) => {
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

  console.log({ countryData });

  // Перетворюємо об'єкт у масив для використання в BarChart
  const data: CategoryValueItem[] = Object.keys(countryData).map((country) => ({
    label: country,
    value: Number(
      (countryData[country].totalRate / countryData[country].count).toFixed(2),
    ),
  }));

  const maxRate = roundToSignificant(
    Math.max(...data.map((item) => item.value)),
  );

  const sortedData = data.sort((a, b) => b.value - a.value);
  const limitedData = limit ? sortedData.slice(0, limit) : data;

  return (
    <div className="bg-white p-10 rounded-3xl shadow-md w-full">
      <h2 className="text-xl font-semibold mb-8">Average Rate By Country</h2>
      <ValueByCategoryChart
        data={limitedData}
        maxValue={maxRate}
        minValue={0}
        labelSuffix="$"
      />
    </div>
  );
};

export default AverageRateByCountry;
