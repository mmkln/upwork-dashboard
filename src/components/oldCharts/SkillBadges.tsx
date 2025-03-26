import React from "react";
import { UpworkJob } from "../../models";
import { ValueByCategoryChart, CategoryValueItem } from "../charts";
import Card from "../ui/Card";
import { CopyToClipboardButton } from "../elements";
import { Badge } from "../ui";

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
  const instrumentsText = limitedData.map(({ label }) => label).join(", ");

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">
            Top {limitedData.length} Skills
          </h2>
          <CopyToClipboardButton data={instrumentsText} name="Skills" />
        </div>
        {/*<div className="overflow-auto over h-[21.5rem]">*/}
        <div className="flex flex-wrap gap-2">
          {limitedData.map(({ label, value }) => (
            <Badge key={label} label={label} value={value} maxRate={maxRate} />
          ))}
        </div>
        {/*</div>*/}
      </div>
    </Card>
  );
};

export default SkillBadges;
