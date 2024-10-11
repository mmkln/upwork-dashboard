import React from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { UpworkJob } from "../models";

interface SkillsTreeMapChartProps {
  jobs: UpworkJob[];
}

const SkillsTreeMapChart: React.FC<SkillsTreeMapChartProps> = ({ jobs }) => {
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

  // Перетворюємо об'єкт у масив для використання в TreeMap
  const data = Object.keys(skillsData).map((skill) => ({
    name: skill,
    size: skillsData[skill].count,
    avgRate:
      skillsData[skill].count > 0
        ? skillsData[skill].totalRate / skillsData[skill].count
        : 0,
  }));

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-4">Skills Treemap</h2>
      <ResponsiveContainer width="100%" height={500}>
        <Treemap
          data={data}
          dataKey="size"
          nameKey="name"
          aspectRatio={4 / 3}
          stroke="#fff"
          content={<Tooltip />}
        />
      </ResponsiveContainer>
    </div>
  );
};

export default SkillsTreeMapChart;
