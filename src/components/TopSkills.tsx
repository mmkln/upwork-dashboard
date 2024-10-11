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
  const skillsData = jobs.reduce((acc: { [key: string]: number }, job) => {
    if (job.skills) {
      job.skills.forEach((skill: string) => {
        if (!acc[skill]) {
          acc[skill] = 1;
        } else {
          acc[skill] += 1;
        }
      });
    }
    return acc;
  }, {});

  // Перетворюємо об'єкт у масив для використання в BarChart
  const data = Object.keys(skillsData).map((skill) => ({
    label: skill,
    value: skillsData[skill],
  }));

  const maxRate = roundToSignificant(
    Math.max(...data.map((item) => item.value)),
  );

  const sortedData = data.sort((a, b) => b.value - a.value);
  const limitedData = limit ? sortedData.slice(0, limit) : data;

  return (
    <div className="bg-white p-10 rounded-3xl shadow-md w-full">
      <h2 className="text-xl font-semibold mb-8">Top {limit} Skills</h2>
      <ValueByCategoryChart
        data={limitedData}
        maxValue={maxRate}
        minValue={0}
      />
    </div>
  );
};

export default AverageRateByCountry;
