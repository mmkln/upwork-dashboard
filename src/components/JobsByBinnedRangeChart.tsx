import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { UpworkJob } from "../models";

interface JobsByBinnedRangeChartProps {
  jobs: UpworkJob[];
  rangeStep?: number; // Динамічний крок для діапазону рейту
}

const JobsByBinnedRangeChart: React.FC<JobsByBinnedRangeChartProps> = ({
  jobs,
  rangeStep = 20, // За замовчуванням крок 20
}) => {
  // Визначаємо максимальний рейт для створення діапазонів
  const maxRate = useMemo(() => {
    return jobs.reduce((max, job) => {
      if (job.hourly_rates && job.hourly_rates.length > 0) {
        return Math.max(max, ...job.hourly_rates);
      }
      return max;
    }, 0);
  }, [jobs]);

  // Створюємо динамічні діапазони на основі кроку rangeStep
  const createRateCategories = (step: number, max: number) => {
    const categories: {
      [key: string]: { min: number; max: number; avg: number };
    } = {};
    for (let i = 0; i <= max; i += step) {
      categories[`${i}-${i + step}`] = { min: 0, max: 0, avg: 0 };
    }
    return categories;
  };

  // Обчислюємо дані для графіка та мемоізуємо їх
  const data = useMemo(() => {
    const rateCategories = createRateCategories(rangeStep, maxRate);

    jobs.forEach((job) => {
      if (job.hourly_rates && job.hourly_rates.length > 0) {
        const minRate = Math.min(...job.hourly_rates);
        const maxRate = Math.max(...job.hourly_rates);
        const avgRate =
          job.hourly_rates.reduce((sum, rate) => sum + rate, 0) /
          job.hourly_rates.length;

        // Мінімальний рейт
        const assignRateToCategoryOld = (
          rate: number,
          key: "min" | "max" | "avg",
        ) => {
          Object.keys(rateCategories).forEach((range) => {
            const [start, end] = range.split("-").map(Number);
            if (rate >= start && rate <= end) {
              rateCategories[range][key] += 1;
            }
          });
        };

        const assignRateToCategory = (
          rate: number,
          key: "min" | "max" | "avg",
        ) => {
          Object.keys(rateCategories).forEach((range) => {
            const [start, end] = range.split("-").map(Number);
            if (rate >= start && rate <= end) {
              rateCategories[range][key] += 1;
            }
            // Якщо rate дорівнює верхньому значенню діапазону, додаємо до наступного діапазону
            else if (rate === end) {
              const nextRange = `${end}-${end + rangeStep}`;
              if (rateCategories[nextRange]) {
                rateCategories[nextRange][key] += 1;
              }
            }
          });
        };

        assignRateToCategory(minRate, "min");
        assignRateToCategory(maxRate, "max");
        assignRateToCategory(avgRate, "avg");
      }
    });

    // Формуємо дані для графіка
    return Object.keys(rateCategories).map((range) => ({
      range,
      minRateCount: rateCategories[range].min,
      maxRateCount: rateCategories[range].max,
      avgRateCount: rateCategories[range].avg,
    }));
  }, [jobs, rangeStep, maxRate]);

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-4">
        Jobs by Rate Range (Min, Avg & Max)
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip formatter={(value, name) => [`${value} jobs`, name]} />
          <Legend />
          <Bar
            dataKey="minRateCount"
            stackId="a"
            fill="#82ca9d"
            name="Min Rate Count"
          />
          <Bar
            dataKey="avgRateCount"
            stackId="a"
            fill="#FFBB28"
            name="Avg Rate Count"
          />
          <Bar
            dataKey="maxRateCount"
            stackId="a"
            fill="#8884d8"
            name="Max Rate Count"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default JobsByBinnedRangeChart;
