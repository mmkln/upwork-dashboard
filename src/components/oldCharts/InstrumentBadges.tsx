import React, { useMemo } from "react";
import { UpworkJob } from "../../models";

interface ToolFrequencyChartProps {
  jobs: UpworkJob[];
  limit?: number;
}

// Список інструментів
const toolsList: string[] = [
  "Active Campaign",
  "Airtable",
  "Apollo",
  "Amwork",
  "Automation Anywhere",
  "Beehiiv",
  "bolt.new",
  "Brevo",
  "bubble.io",
  "Caspio",
  "chatbotbuilder.ai",
  "clearout",
  "Click Funnels",
  "ClickUp",
  "Close CRM",
  "Coda",
  "Drawio",
  "Dumpling",
  "Fireflies",
  "Funnelytics",
  "getimg",
  "GoHighLevel",
  "GHL",
  "Harvest",
  "HubSpot",
  "Klaviyo",
  "Leadpages",
  "Luma",
  "Make.com",
  "Manatal",
  "Manychat",
  "Mautic",
  "MindManager",
  "Monday",
  "n8n",
  "Pabbly",
  "PandaDoc",
  "PhantomBuster",
  "Pipedrive",
  "Play.ai",
  "Podio",
  "QuickBooks",
  "Rentman",
  "Retell",
  "RingCentral",
  "Salesforce",
  "SendGrid",
  "Shopify",
  "Slack",
  "Softr",
  "Squarespace",
  "Twilio",
  "Vapi",
  "Whimsical",
  "Wix",
  "Xero",
  "Zapier",
  "Zoho",
];

// Функція для підрахунку частоти інструментів
const getToolFrequency = (jobs: UpworkJob[]): { [key: string]: number } => {
  const frequency: { [key: string]: number } = {};

  // Підготовка регулярних виразів для кожного інструменту
  const toolRegexes = toolsList.map((tool) => ({
    tool,
    regex: new RegExp(`\\b${escapeRegExp(tool)}\\b`, "i"),
  }));

  jobs.forEach((job) => {
    toolRegexes.forEach(({ tool, regex }) => {
      const inTitle = regex.test(job.title);
      const inDescription = regex.test(job.description);
      const inSkills = job.skills.some(
        (skill) => skill.toLowerCase() === tool.toLowerCase(),
      );

      if (inTitle || inDescription || inSkills) {
        frequency[tool] = (frequency[tool] || 0) + 1;
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

  return (
    <div className="bg-white p-8 rounded-3xl shadow w-full">
      <h2 className="text-lg font-semibold mb-8">
        Top {limit && limit} Instruments
      </h2>
      <div className="flex flex-wrap gap-2">
        {limitedData.map(({ tool, count }) => {
          const frequencyRatio = count / maxFrequency;
          const backgroundColor = `rgba(59, 130, 246, ${frequencyRatio})`;
          const color =
            frequencyRatio > 0.7
              ? "rgba(255,255,255, 0.95)"
              : "rgba(45,59,101,0.8)";

          return (
            <div
              key={tool}
              className={`relative px-2 py-1 rounded-xl text-xs font-medium group`}
              style={{
                backgroundColor,
                color,
              }}
            >
              {tool.length > 15 ? `${tool.slice(0, 12).trim()}..` : tool}
              <div className="hidden group-hover:flex absolute bottom-8 left-0 bg-white border border-gray-200 rounded-xl px-3 py-1 text-gray-800 z-10">
                {tool}: {count} {count === 1 ? "раз" : "рази"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ToolFrequencyChart;
