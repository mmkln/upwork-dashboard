import React, { useMemo } from "react";
import { UpworkJob } from "../../models";
import { instruments } from "../../utils";
import Card from "../ui/Card";
import { CopyToClipboardButton } from "../elements";
import { Badge } from "../ui";

interface ToolFrequencyChartProps {
  jobs: UpworkJob[];
  limit?: number;
}

// Список інструментів

// Функція для підрахунку частоти інструментів
const getToolFrequency = (jobs: UpworkJob[]): { [key: string]: number } => {
  const frequency: { [key: string]: number } = {};

  // Підготовка регулярних виразів для кожного інструменту
  const toolRegexes = instruments.map((toolEntry) => {
    const mainTool = Array.isArray(toolEntry) ? toolEntry[0] : toolEntry;
    const synonyms = Array.isArray(toolEntry) ? toolEntry : [toolEntry];
    return {
      mainTool,
      regexes: synonyms.map(
        (synonym) =>
          new RegExp(`\\b${escapeRegExp(synonym.toLowerCase())}\\b`, "i"),
      ),
    };
  });

  jobs.forEach((job) => {
    toolRegexes.forEach(({ mainTool, regexes }) => {
      const inTitle = regexes.some((regex) =>
        regex.test(job.title.toLowerCase()),
      );
      const inDescription = regexes.some((regex) =>
        regex.test(job.description.toLowerCase()),
      );
      const inSkills = job.skills.some((skill) =>
        regexes.some((regex) => regex.test(skill.toLowerCase())),
      );

      if (inTitle || inDescription || inSkills) {
        frequency[mainTool] = (frequency[mainTool] || 0) + 1;
      }
    });
  });

  return frequency;
};

// Функція для екранування спеціальних символів у регулярних виразах
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Компонент для відображення частоти інструментів
const ToolFrequencyChart: React.FC<ToolFrequencyChartProps> = ({
  jobs,
  limit,
}) => {
  const toolFrequency = useMemo(() => getToolFrequency(jobs), [jobs]);

  // Перетворення об'єкту на масив і сортування
  const data = Object.entries(toolFrequency)
    .map(([tool, count]) => ({ tool, count }))
    .sort((a, b) => b.count - a.count);

  // Обмеження кількості відображуваних інструментів, якщо задано
  const limitedData = limit ? data.slice(0, limit) : data;

  // Визначення максимального значення для масштабування кольорів
  const maxFrequency =
    limitedData.length > 0
      ? Math.max(...limitedData.map((item) => item.count))
      : 1;

  const instrumentsText = limitedData.map(({ tool }) => tool).join(", ");

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">
            Top {limit && limit} Instruments
          </h2>
          <CopyToClipboardButton data={instrumentsText} name="Instruments" />
        </div>
        <div className="flex flex-wrap gap-2">
          {limitedData.map(({ tool, count }) => (
            <Badge
              key={tool}
              label={tool}
              value={count}
              maxRate={maxFrequency}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ToolFrequencyChart;
