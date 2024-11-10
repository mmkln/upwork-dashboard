import React from "react";
import { UpworkJob } from "../../models";
import { CategoryValueItem, ValueByCategoryChart } from "../charts";

interface MinMaxRateByCountryProps {
  jobs: UpworkJob[];
  limit?: number;
}

const roundToSignificant = (num: number): number => {
  if (num < 10) return 10;
  const power = Math.pow(10, Math.floor(Math.log10(num)));
  return Math.ceil(num / power) * power;
};

const JobRatesByCountryAvg: React.FC<MinMaxRateByCountryProps> = ({
  jobs,
  limit,
}) => {
  const countryData = jobs.reduce(
    (
      acc: {
        [key: string]: { minRate: number; maxRate: number; count: number };
      },
      job,
    ) => {
      if (job.country && job.hourly_rates?.length) {
        if (!acc[job.country]) {
          acc[job.country] = {
            minRate: Number(job.hourly_rates[0]),
            maxRate: Number(job.hourly_rates[1]),
            count: 1,
          };
        } else {
          if (acc[job.country].minRate > Number(job.hourly_rates[0])) {
            acc[job.country].minRate = Number(job.hourly_rates[0]);
          }
          if (acc[job.country].maxRate < Number(job.hourly_rates[1])) {
            acc[job.country].maxRate = Number(job.hourly_rates[1]);
          }
          acc[job.country].count++;
        }
      }
      return acc;
    },
    {},
  );

  const data: CategoryValueItem[] = Object.keys(countryData).map((country) => ({
    label: country,
    value:
      (Number(countryData[country].minRate.toFixed(2)) +
        Number(countryData[country].maxRate.toFixed(2))) /
      2,
    count: countryData[country].count,
  }));

  const maxRate = roundToSignificant(
    Math.max(...data.map((item) => item.value)),
  );

  const sortedData = data.sort((a, b) => b.value - a.value);
  const limitedData = limit ? sortedData.slice(0, limit) : data;

  return (
    <div className="bg-white p-8 rounded-3xl shadow w-full">
      <h2 className="text-lg font-semibold mb-8">Job Rate by Country (avg.)</h2>
      <ValueByCategoryChart
        data={limitedData}
        maxValue={maxRate}
        minValue={0}
        labelSuffix="$"
      />
    </div>
  );
};

export default JobRatesByCountryAvg;
