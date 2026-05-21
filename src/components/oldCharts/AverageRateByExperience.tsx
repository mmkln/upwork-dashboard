import React from "react";
import { JobExperience, UpworkJob } from "../../models";
import { ValueByCategoryChart, CategoryValueItem } from "../charts";
import { findAvg } from "../../utils";
import { chartColors } from "../../shared/theme";
import { Card } from "../../shared/ui";

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
      if (job.experience && job.hourly_rates && job.hourly_rates.length) {
        if (!acc[job.experience]) {
          acc[job.experience] = {
            totalRate: findAvg(job.hourly_rates),
            count: 1,
          };
        } else {
          acc[job.experience].totalRate += findAvg(job.hourly_rates);
          acc[job.experience].count += 1;
        }
      }
      return acc;
    },
    {},
  );

  const experienceColorKeys: { [key: string]: string } = {
    [JobExperience.Entry]: chartColors.primary,
    [JobExperience.Intermediate]: chartColors.green,
    [JobExperience.Expert]: chartColors.amber,
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
      count: experienceData[experience].count,
    }),
  );

  const maxRate = roundToSignificant(
    Math.max(...data.map((item) => item.value)),
  );

  // const sortedData = data.sort((a, b) => b.value - a.value);

  return (
    <Card>
      <div className="w-full max-w-sm p-card">
        <h2 className="mb-card text-heading text-text-primary">
          Rate by Experience (avg.)
        </h2>
        <ValueByCategoryChart
          data={data}
          maxValue={maxRate}
          minValue={0}
          labelSuffix="$"
        />
      </div>
    </Card>
  );
};

export default AverageRateByExperience;
