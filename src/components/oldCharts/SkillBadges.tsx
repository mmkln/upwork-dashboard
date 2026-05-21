import React from "react";
import { UpworkJob } from "../../models";
import { CopyToClipboardButton } from "../elements";
import { Badge } from "../ui";
import { Card } from "../../shared/ui";

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
        skill = skill.trim();
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
    <Card className="p-card">
      <div className="flex items-center justify-between gap-control">
        <h2 className="text-heading text-text-primary">
          Top {limitedData.length} Skills
        </h2>
        <CopyToClipboardButton data={instrumentsText} name="Skills" />
      </div>
      <div className="mt-card flex flex-wrap gap-item">
        {limitedData.map(({ label, value }) => (
          <Badge key={label} label={label} value={value} maxRate={maxRate} />
        ))}
      </div>
    </Card>
  );
};

export default SkillBadges;
