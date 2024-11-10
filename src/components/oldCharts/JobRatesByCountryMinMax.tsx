import React from "react";
import { UpworkJob } from "../../models";
import { CategoryValuesItem, MultiValueChart } from "../charts";
import { findAvg } from "../../utils";

interface MinMaxRateByCountryProps {
  jobs: UpworkJob[];
  limit?: number;
}

const roundToSignificant = (num: number): number => {
  if (num < 10) return 10;
  const power = Math.pow(10, Math.floor(Math.log10(num)));
  return Math.ceil(num / power) * power;
};

const JobRatesByCountryMinMax: React.FC<MinMaxRateByCountryProps> = ({
  jobs,
  limit,
}) => {
  const countryData = jobs.reduce(
    (
      acc: {
        [key: string]: {
          minRate: number;
          maxRate: number;
          avgRate: number[];
          count: number;
        };
      },
      job,
    ) => {
      if (job.country && job.hourly_rates?.length) {
        if (!acc[job.country]) {
          acc[job.country] = {
            minRate: Number(job.hourly_rates[0]),
            maxRate: Number(job.hourly_rates[1]),
            avgRate: [findAvg(job.hourly_rates)],
            count: 1,
          };
        } else {
          if (acc[job.country].minRate > Number(job.hourly_rates[0])) {
            acc[job.country].minRate = Number(job.hourly_rates[0]);
          }
          if (acc[job.country].maxRate < Number(job.hourly_rates[1])) {
            acc[job.country].maxRate = Number(job.hourly_rates[1]);
          }
          acc[job.country].avgRate.push(findAvg(job.hourly_rates));
          acc[job.country].count++;
        }
      }
      return acc;
    },
    {},
  );

  const data: CategoryValuesItem[] = Object.keys(countryData).map(
    (country) => ({
      label: country,
      values: [
        Number(countryData[country].minRate.toFixed(2)),
        Number(findAvg(countryData[country].avgRate).toFixed(2)),
        Number(countryData[country].maxRate.toFixed(2)),
      ],
      count: countryData[country].count,
    }),
  );

  const maxRate = roundToSignificant(
    Math.max(...data.map((item) => Math.max(...item.values))),
  );

  const sortedData = data.sort(
    (a, b) => Math.max(...b.values) - Math.max(...a.values),
  );
  const limitedData = limit ? sortedData.slice(0, limit) : data;

  return (
    <div className="bg-white p-8 rounded-3xl shadow w-full">
      <h2 className="text-lg font-semibold mb-8">
        Job Rate by Country (min & max)
      </h2>
      <MultiValueChart
        data={limitedData}
        maxValue={maxRate}
        minValue={0}
        labelSuffix="$"
      />
    </div>
  );
};

export default JobRatesByCountryMinMax;
