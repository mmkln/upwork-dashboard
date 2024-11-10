import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { UpworkJob } from "../../models";

interface SkillsBubbleChartProps {
  jobs: UpworkJob[];
}

const SkillsBubbleChart: React.FC<SkillsBubbleChartProps> = ({ jobs }) => {
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

  // Перетворюємо об'єкт у масив для використання в BubbleChart
  const data = Object.keys(skillsData).map((skill) => ({
    skill,
    count: skillsData[skill].count,
    avgRate:
      skillsData[skill].count > 0
        ? skillsData[skill].totalRate / skillsData[skill].count
        : 0,
  }));

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-4">Skills Bubble Chart</h2>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart>
          <CartesianGrid />
          <XAxis type="category" dataKey="skill" name="Skill" />
          <YAxis type="number" dataKey="count" name="Mentions" />
          <Tooltip
            formatter={(value, name, entry) => [
              `${value} mentions`,
              `Avg rate: $${entry.payload.avgRate.toFixed(2)}`,
            ]}
          />
          <Scatter data={data} fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillsBubbleChart;
