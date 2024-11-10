import React from "react";
import { UpworkJob } from "../../models";
import { CategoryValuesItem, MultiValueChart } from "../charts";

interface MinMaxRateByCountryProps {
  jobs: UpworkJob[];
  limit?: number;
}

const roundToSignificant = (num: number): number => {
  if (num < 10) return 10;
  const power = Math.pow(10, Math.floor(Math.log10(num)));
  return Math.ceil(num / power) * power;
};

const AvgMinMaxJobRatesByCountry: React.FC<MinMaxRateByCountryProps> = ({
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
          acc[job.country].minRate += Number(job.hourly_rates[0]);
          acc[job.country].maxRate += Number(job.hourly_rates[1]);
          acc[job.country].count += 1;
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
        Number(
          (countryData[country].minRate / countryData[country].count).toFixed(
            2,
          ),
        ),
        Number(
          (countryData[country].maxRate / countryData[country].count).toFixed(
            2,
          ),
        ),
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
    <div className="bg-white p-8 rounded-3xl shadow-md w-full">
      <h2 className="text-lg font-semibold mb-8">
        Job Rate by Country (min & max avg.)
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

export default AvgMinMaxJobRatesByCountry;
