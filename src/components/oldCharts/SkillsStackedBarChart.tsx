import React from "react";
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
import { UpworkJob } from "../../models";

interface SkillsStackedBarChartProps {
  jobs: UpworkJob[];
}

const SkillsStackedBarChart: React.FC<SkillsStackedBarChartProps> = ({
  jobs,
}) => {
  // Constant for the number of top results
  const TOP_SKILLS_COUNT = 30;

  // Групуємо навички за типами робіт (погодинні та фіксовані)
  const skillsData = jobs.reduce(
    (acc: { [key: string]: { hourly: number; fixed: number } }, job) => {
      const jobType =
        job.hourly_rates && job.hourly_rates.length > 0 ? "hourly" : "fixed";

      if (job.skills) {
        job.skills.forEach((skill: string) => {
          if (!acc[skill]) {
            acc[skill] = { hourly: 0, fixed: 0 };
          }
          acc[skill][jobType] += 1;
        });
      }
      return acc;
    },
    {},
  );

  // Перетворюємо об'єкт у масив для використання в BarChart
  const data = Object.keys(skillsData).map((skill) => ({
    skill,
    hourly: skillsData[skill].hourly,
    fixed: skillsData[skill].fixed,
    total: skillsData[skill].hourly + skillsData[skill].fixed,
  }));

  // Filter and sort to get the top 30 skills
  const topData = data
    .sort((a, b) => b.total - a.total)
    .slice(0, TOP_SKILLS_COUNT);

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-4">
        Skills by Job Type (Stacked Bar Chart)
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={topData}
          margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="skill"
            angle={-45}
            textAnchor="end"
            interval={0}
            height={60}
            style={{ fontSize: "10px", fontWeight: "bold", fill: "#333" }}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="hourly" stackId="a" fill="#8884d8" />
          <Bar dataKey="fixed" stackId="a" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SkillsStackedBarChart;
