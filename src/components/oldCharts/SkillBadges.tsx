import React from "react";
import { UpworkJob } from "../../models";
import { ValueByCategoryChart, CategoryValueItem } from "../charts";

interface AverageRateByCountryProps {
  jobs: UpworkJob[];
  limit?: number;
}

const roundToSignificant = (num: number): number => {
  if (num < 10) return 10; // Значення менше 10 округлюємо до 10
  const power = Math.pow(10, Math.floor(Math.log10(num)));
  return Math.ceil(num / power) * power; // Округлення до найближчого значного числа
};

const SkillBadges: React.FC<AverageRateByCountryProps> = ({ jobs, limit }) => {
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
    label: skill,
    value: skillsData[skill],
  }));

  const maxRate = roundToSignificant(
    Math.max(...data.map((item) => item.value)),
  );

  const sortedData = data.sort((a, b) => b.value - a.value);
  const limitedData = limit ? sortedData.slice(0, limit) : data;

  return (
    <div className="bg-white p-8 rounded-3xl shadow w-full">
      <h2 className="text-lg font-semibold mb-8">
        Top {limitedData.length} Skills
      </h2>
      {/*<div className="overflow-auto over h-[21.5rem]">*/}
      <div className="flex flex-wrap gap-2 ">
        {limitedData.map(({ label, value }) => {
          const rateDiff = value / maxRate;
          const color = "";
          return (
            <div
              className="relative px-2 py-1 rounded-xl text-xs font-medium group/skill"
              style={{
                backgroundColor: `rgba(59, 130, 246, ${rateDiff})`,
                color: `${rateDiff > 0.5 ? "rgba(255,255,255, 0.95)" : "rgba(45,59,101,0.8)"}`,
              }}
            >
              {label.length > 12 ? label.slice(0, 8).trim() + ".." : label}
              <div className="hidden group-hover/skill:flex absolute bottom-7 bg-white border border-gray-200 rounded-xl px-2 py-1 text-gray-800">
                ({value}) {label}
              </div>
            </div>
          );
        })}
      </div>
      {/*</div>*/}
    </div>
  );
};

export default SkillBadges;
