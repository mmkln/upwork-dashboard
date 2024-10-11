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
import { UpworkJob } from "../models";

interface JobsByStackedAreaChartProps {
  jobs: UpworkJob[];
  rangeStep?: number; // Динамічний крок для діапазонів
  minColor?: string; // Колір для minRate
  maxColor?: string; // Колір для maxRate
  avgColor?: string; // Колір для avgRate
}

const JobsByStackedAreaChart: React.FC<JobsByStackedAreaChartProps> = ({
  jobs,
  rangeStep = 10, // За замовчуванням крок 10 (0-10, 11-20 і т.д.)
  minColor = "#82ca9d",
  maxColor = "#8884d8",
  avgColor = "#ff8042",
}) => {
  // Визначаємо максимальний рейт для створення динамічного кінцевого діапазону
  const maxRate = useMemo(() => {
    return jobs.reduce((max, job) => {
      if (job.hourly_rates && job.hourly_rates.length > 0) {
        return Math.max(max, ...job.hourly_rates);
      }
      return max;
    }, 0);
  }, [jobs]);

  // Створюємо динамічні діапазони на основі rangeStep і maxRate
  const createRateCategories = (step: number, max: number) => {
    const categories: {
      [key: string]: { min: number; max: number; avg: number };
    } = {};
    for (let i = 0; i <= max; i += step) {
      categories[`${i}-${i + step}`] = { min: 0, max: 0, avg: 0 };
    }
    categories[`${Math.floor(max / step) * step}+`] = {
      min: 0,
      max: 0,
      avg: 0,
    }; // Динамічна остання категорія
    return categories;
  };

  // Обчислюємо дані для графіку та мемоізуємо їх
  const data = useMemo(() => {
    const rateCategories = createRateCategories(rangeStep, maxRate);

    jobs.forEach((job) => {
      if (job.hourly_rates && job.hourly_rates.length > 0) {
        const minRate = Math.min(...job.hourly_rates);
        const maxRate = Math.max(...job.hourly_rates);
        const avgRate =
          job.hourly_rates.reduce((sum, rate) => sum + rate, 0) /
          job.hourly_rates.length;

        // Розподіл по мінімальному, середньому та максимальному рейтам
        const assignRateToCategory = (
          rate: number,
          key: "min" | "max" | "avg",
        ) => {
          const rangeKey = Object.keys(rateCategories).find((range) => {
            const [start, end] = range.split("-").map(Number);
            return !isNaN(end) ? rate >= start && rate <= end : rate >= start;
          });
          if (rangeKey) rateCategories[rangeKey][key] += 1;
        };

        assignRateToCategory(minRate, "min");
        assignRateToCategory(maxRate, "max");
        assignRateToCategory(avgRate, "avg");
      }
    });

    // Формуємо фінальні дані для відображення
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
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip formatter={(value, name) => [`${value} jobs`, name]} />
          <Legend />
          <Area
            type="monotone"
            dataKey="minRateCount"
            stackId="1"
            stroke={minColor}
            fill={minColor}
            name="Min Rate Count"
          />
          <Area
            type="monotone"
            dataKey="avgRateCount"
            stackId="1"
            stroke={avgColor}
            fill={avgColor}
            name="Avg Rate Count"
          />
          <Area
            type="monotone"
            dataKey="maxRateCount"
            stackId="1"
            stroke={maxColor}
            fill={maxColor}
            name="Max Rate Count"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default JobsByStackedAreaChart;
