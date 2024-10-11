import React from "react";
import { JobExperience, UpworkJob } from "../models";
import { ValueByCategoryChart, CategoryValueItem } from "./charts";

interface AverageRateByExperienceProps {
  jobs: UpworkJob[];
}

const roundToSignificant = (num: number): number => {
  if (num < 10) return 10; // Значення менше 10 округлюємо до 10
  const power = Math.pow(10, Math.floor(Math.log10(num)));
  return Math.ceil(num / power) * power; // Округлення до найближчого значного числа
};

const AverageRateByExperience: React.FC<AverageRateByExperienceProps> = ({
  jobs,
}) => {
  // Створюємо дані по рівнях досвіду
  const experienceData = jobs.reduce(
    (acc: { [key: string]: { totalRate: number; count: number } }, job) => {
      if (job.experience && job.average_rate !== null) {
        if (!acc[job.experience]) {
          acc[job.experience] = {
            totalRate: Number(job.average_rate),
            count: 1,
          };
        } else {
          acc[job.experience].totalRate += Number(job.average_rate);
          acc[job.experience].count += 1;
        }
      }
      return acc;
    },
    {},
  );

  const experienceColorKeys: { [key: string]: string } = {
    [JobExperience.Entry]: "#3f88ff",
    [JobExperience.Intermediate]: "#5ac59f", // Синій для Intermediate
    [JobExperience.Expert]: "#f4bb29",
  };

  // Перетворюємо об'єкт у масив для використання в BarChart
  const data: CategoryValueItem[] = Object.keys(experienceData).map(
    (experience) => ({
      label: experience,
      color: experienceColorKeys[experience],
      value: Number(
        (
          experienceData[experience].totalRate /
          experienceData[experience].count
        ).toFixed(2),
      ),
    }),
  );

  const maxRate = roundToSignificant(
    Math.max(...data.map((item) => item.value)),
  );

  const sortedData = data.sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white p-8 rounded-3xl shadow-md w-full max-w-sm">
      <h2 className="text-lg font-semibold mb-8">Average Rate By Experience</h2>
      <ValueByCategoryChart
        data={sortedData}
        maxValue={maxRate}
        minValue={0}
        labelSuffix="$"
      />
    </div>
  );
};

export default AverageRateByExperience;
