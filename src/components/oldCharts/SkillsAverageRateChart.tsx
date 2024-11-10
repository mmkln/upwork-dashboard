import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { UpworkJob } from "../../models";

interface SkillsAverageRateChartProps {
  jobs: UpworkJob[];
}

const TOP_SKILLS_COUNT = 30;

const SkillsAverageRateChart: React.FC<SkillsAverageRateChartProps> = ({
  jobs,
}) => {
  // Підраховуємо середню оплату для кожної навички
  const skillsData = jobs.reduce(
    (acc: { [key: string]: { totalRate: number; count: number } }, job) => {
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
            acc[skill] = { totalRate: averageRate, count: 1 };
          } else {
            acc[skill].totalRate += averageRate;
            acc[skill].count += 1;
          }
        });
      }
      return acc;
    },
    {},
  );

  // Перетворюємо об'єкт у масив для використання в BarChart
  const data = Object.keys(skillsData).map((skill) => ({
    skill,
    averageRate: skillsData[skill].totalRate / skillsData[skill].count,
  }));

  // Сортуємо за середньою оплатою і відображаємо тільки топ-10 навичок
  const sortedData = data
    .sort((a, b) => b.averageRate - a.averageRate)
    .slice(0, TOP_SKILLS_COUNT); // Топ 10 навичок з найвищою оплатою

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-4">
        Top {TOP_SKILLS_COUNT} Skills by Average Rate
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="skill"
            angle={-45}
            textAnchor="end"
            interval={0}
            height={60}
            style={{ fontSize: "12px" }}
          />
          <YAxis />
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
          <Bar dataKey="averageRate" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillsAverageRateChart;
