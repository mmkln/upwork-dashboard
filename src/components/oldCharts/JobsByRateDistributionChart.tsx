import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { UpworkJob } from "../../models";

interface JobsByRateDistributionChartProps {
  jobs: UpworkJob[];
  valueStep?: number; // Крок для значень на осі X
  minColor?: string; // Колір для minRate
  maxColor?: string; // Колір для maxRate
}

const JobsByRateDistributionChart: React.FC<
  JobsByRateDistributionChartProps
> = ({
  jobs,
  valueStep = 10, // Крок значення по осі X
  minColor = "#82ca9d",
  maxColor = "#8884d8",
}) => {
  // Визначаємо максимальний рейт для створення кроків
  const maxRate = useMemo(() => {
    return jobs.reduce((max, job) => {
      if (job.hourly_rates && job.hourly_rates.length > 0) {
        return Math.max(max, ...job.hourly_rates);
      }
      return max;
    }, 0);
  }, [jobs]);

  // Створюємо значення по осі X на основі valueStep
  const createRateBuckets = (step: number, max: number) => {
    const buckets: { [key: string]: { count: number } } = {};
    for (let i = 0; i <= max; i += step) {
      buckets[i.toString()] = { count: 0 };
    }
    return buckets;
  };

  // Обчислюємо дані для графіка та мемоізуємо їх
  const data = useMemo(() => {
    const maxValue = maxRate + valueStep;
    const rateBuckets = createRateBuckets(valueStep, maxValue);

    // Проходимо через всі значення осі X (кожен крок)
    Object.keys(rateBuckets).forEach((bucket) => {
      const bucketValue = Number(bucket); // Значення рейту на осі X
      jobs.forEach((job) => {
        if (job.hourly_rates && job.hourly_rates.length > 0) {
          const minRate = Math.min(...job.hourly_rates);
          const maxRate = Math.max(...job.hourly_rates);

          // Якщо bucketValue (ось X) знаходиться в інтервалі між мінімальним і максимальним рейтом задачі
          if (bucketValue >= minRate && bucketValue <= maxRate) {
            rateBuckets[bucket].count += 1;
          }
        }
      });
    });

    // Формуємо фінальні дані для відображення
    return Object.keys(rateBuckets).map((bucket) => ({
      rate: bucket, // Значення осі X (рейт)
      count: rateBuckets[bucket].count, // Кількість задач, що потрапляють у цей рейт
    }));
  }, [jobs, valueStep, maxRate]);

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-4">Jobs by Rate Distribution</h2>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="rate" tickFormatter={(tick) => `$${tick}`} />
          <YAxis />
          <Tooltip formatter={(value) => [`${value} jobs`]} />
          <Legend />
          <Area
            type="monotone"
            dataKey="count"
            stroke={minColor}
            fill={minColor}
            name="Jobs Count"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default JobsByRateDistributionChart;
