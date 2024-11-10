import React from "react";
import { UpworkJob } from "../../models";
import { CategoryValueItem, ValueByCategoryChart } from "../charts";
import { findMedian } from "../../utils";

interface MinMaxRateByCountryProps {
  jobs: UpworkJob[];
  limit?: number;
}

const roundToSignificant = (num: number): number => {
  if (num < 10) return 10;
  const power = Math.pow(10, Math.floor(Math.log10(num)));
  return Math.ceil(num / power) * power;
};

const JobRatesByCountryMed: React.FC<MinMaxRateByCountryProps> = ({
  jobs,
  limit,
}) => {
  const countryData = jobs.reduce(
    (
      acc: {
        [key: string]: { medRates: number[]; count: number };
      },
      job,
    ) => {
      if (job.country && job.hourly_rates?.length) {
        if (!acc[job.country]) {
          acc[job.country] = {
            medRates: [
              (Number(job.hourly_rates[0]) + Number(job.hourly_rates[1])) / 2,
            ],
            count: 1,
          };
        } else {
          acc[job.country].medRates.push(
            (Number(job.hourly_rates[0]) + Number(job.hourly_rates[1])) / 2,
          );
          acc[job.country].count++;
        }
      }
      return acc;
    },
    {},
  );

  const data: CategoryValueItem[] = Object.keys(countryData).map((country) => ({
    label: country,
    value: findMedian(countryData[country].medRates),
    count: countryData[country].count,
  }));

  const maxRate = roundToSignificant(
    Math.max(...data.map((item) => item.value)),
  );

  const sortedData = data.sort((a, b) => b.value - a.value);
  const limitedData = limit ? sortedData.slice(0, limit) : data;

  return (
    <div className="bg-white p-8 rounded-3xl shadow w-full">
      <h2 className="text-lg font-semibold mb-8">Job Rate by Country (med.)</h2>
      <ValueByCategoryChart
        data={limitedData}
        maxValue={maxRate}
        minValue={0}
        labelSuffix="$"
      />
    </div>
  );
};

export default JobRatesByCountryMed;
