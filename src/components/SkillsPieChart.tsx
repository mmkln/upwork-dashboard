import React from "react";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { UpworkJob } from "../models";

interface SkillsPieChartProps {
  jobs: UpworkJob[];
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
  "#ffc658",
];

const SkillsPieChart: React.FC<SkillsPieChartProps> = ({ jobs }) => {
  // Групуємо навички і підраховуємо їхню частоту та середню ставку
  const skillsData = jobs.reduce(
    (acc: { [key: string]: { count: number; totalRate: number } }, job) => {
      const averageRate =
        job.hourly_rates && job.hourly_rates.length > 0
          ? job.hourly_rates.reduce((sum, rate) => sum + rate, 0) /
            job.hourly_rates.length
          : job.fixed_price
            ? Number(job.fixed_price)
            : 0;

      if (job.skills) {
        job.skills.forEach((skill: string) => {
          if (!acc[skill]) {
            acc[skill] = { count: 1, totalRate: averageRate };
          } else {
            acc[skill].count += 1;
            acc[skill].totalRate += averageRate;
          }
        });
      }
      return acc;
    },
    {},
  );

  // Перетворюємо об'єкт у масив для використання в PieChart
  const data = Object.keys(skillsData).map((skill, index) => ({
    name: skill,
    value: skillsData[skill].count,
    avgRate:
      skillsData[skill].count > 0
        ? skillsData[skill].totalRate / skillsData[skill].count
        : 0,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-4">Skills Pie Chart</h2>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={150}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, entry) => [
              `${value} mentions`,
              `Avg rate: $${entry.payload.avgRate.toFixed(2)}`,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillsPieChart;
