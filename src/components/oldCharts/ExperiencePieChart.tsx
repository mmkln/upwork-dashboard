import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { JobExperience, UpworkJob } from "../../models";

interface ExperiencePieChartProps {
  jobs: UpworkJob[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

const ExperiencePieChart: React.FC<ExperiencePieChartProps> = ({ jobs }) => {
  // Групуємо роботи за рівнями досвіду
  const experienceData = [
    {
      name: "Entry",
      value: jobs.filter((job) => job.experience === JobExperience.Entry)
        .length,
    },
    {
      name: "Intermediate",
      value: jobs.filter((job) => job.experience === JobExperience.Intermediate)
        .length,
    },
    {
      name: "Expert",
      value: jobs.filter((job) => job.experience === JobExperience.Expert)
        .length,
    },
  ];

  const totalJobs = experienceData.reduce((acc, item) => acc + item.value, 0);

  // Кастомна функція для рендерингу підписів
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {experienceData[index].name} ({experienceData[index].value})
      </text>
    );
  };

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-4">Jobs by Experience Level</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={experienceData}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            fill="#8884d8"
            labelLine={false}
            label={renderCustomizedLabel} // Використовуємо кастомні підписи
          >
            {experienceData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) =>
              `${(((value as number) / totalJobs) * 100).toFixed(2)}%`
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExperiencePieChart;
