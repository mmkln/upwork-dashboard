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

interface TopSkillsChartProps {
  jobs: UpworkJob[];
}

const TOP_SKILLS_COUNT = 20;

const TopSkillsChart: React.FC<TopSkillsChartProps> = ({ jobs }) => {
  // Групуємо навички і підраховуємо їхню частоту
  const skillsData = jobs.reduce((acc: { [key: string]: number }, job) => {
    if (job.skills) {
      job.skills.forEach((skill: string) => {
        if (!acc[skill]) {
          acc[skill] = 1;
        } else {
          acc[skill] += 1;
        }
      });
    }
    return acc;
  }, {});

  // Перетворюємо об'єкт у масив для використання в BarChart
  const data = Object.keys(skillsData).map((skill) => ({
    skill,
    count: skillsData[skill],
  }));

  // Сортуємо дані за частотою
  const sortedData = data
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_SKILLS_COUNT); // Топ 20 навичок

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-4">
        Top {TOP_SKILLS_COUNT} Skills
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 100 }} // Додаємо відступ для нахилених лейблів
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="skill"
            angle={-45} // Повертаємо під кутом -45 градусів
            textAnchor="end" // Вирівнюємо лейбли по краю
            interval={0} // Показуємо всі лейбли
            height={30} // Висота для відображення всіх лейблів
            style={{ fontSize: "10px", fontWeight: "bold", fill: "#333" }}
          />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopSkillsChart;
