import React from "react";
import { UpworkJob } from "../../models";

interface KeywordFrequencyChartProps {
  jobs: UpworkJob[];
  limit?: number;
}

const roundToSignificant = (num: number): number => {
  if (num < 10) return 10;
  const power = Math.pow(10, Math.floor(Math.log10(num)));
  return Math.ceil(num / power) * power;
};

const getKeywordFrequency = (jobs: UpworkJob[]): { [key: string]: number } => {
  const commonWords = [
    "and",
    "to",
    "the",
    "a",
    "for",
    "with",
    "you",
    "in",
    "we",
    "of",
    "our",
    "will",
    "are",
    "have",
    "on",
    "that",
    "be",
    "is",
    "an",
    "if",
    "i",
    "this",
    "make",
    "up",
    "it",
    "at",
    "as",
    "by",
    "from",
    "or",
    "not",
    "but",
    "can",
    "all",
    "your",
    "more",
    "was",
    "which",
    "their",
    "has",
    "about",
    "they",
    "been",
    "so",
    "some",
    "com",
    "us",
    "like",
    "please",
    "ensure",
    "based",
    "need",
    "s",
    "re",
    "help",
    "looking",
    "into",
    "want",
    "would",
    "how",
    "understanding",
    "hear",
    "candidate",
    "seeking",
  ];

  return jobs.reduce((acc: { [key: string]: number }, job) => {
    const keywords = `${job.title} ${job.description}`
      .toLowerCase()
      .match(/\b\w+\b/g);
    if (keywords) {
      keywords.forEach((word) => {
        if (!commonWords.includes(word)) {
          if (!acc[word]) {
            acc[word] = 1;
          } else {
            acc[word] += 1;
          }
        }
      });
    }
    return acc;
  }, {});
};

const KeywordFrequencyChart: React.FC<KeywordFrequencyChartProps> = ({
  jobs,
  limit,
}) => {
  const keywordData = getKeywordFrequency(jobs);

  const data = Object.keys(keywordData).map((keyword) => ({
    label: keyword,
    value: keywordData[keyword],
  }));

  const maxFrequency = roundToSignificant(
    Math.max(...data.map((item) => item.value)),
  );

  const sortedData = data.sort((a, b) => b.value - a.value);
  const limitedData = limit ? sortedData.slice(0, limit) : sortedData;

  return (
    <div className="bg-white p-8 rounded-3xl shadow w-full">
      <h2 className="text-lg font-semibold mb-8">
        Top {limitedData.length} Keywords
      </h2>
      <div className="flex flex-wrap gap-2">
        {limitedData.map(({ label, value }) => {
          const frequencyRatio = value / maxFrequency;
          return (
            <div
              key={label}
              className="relative px-2 py-1 rounded-xl text-xs font-medium group/keyword"
              style={{
                backgroundColor: `rgba(59, 130, 246, ${frequencyRatio})`,
                color: `${frequencyRatio > 0.5 ? "rgba(255,255,255, 0.95)" : "rgba(45,59,101,0.8)"}`,
              }}
            >
              {label.length > 12 ? label.slice(0, 8).trim() + ".." : label}
              <div className="hidden group-hover/keyword:flex absolute bottom-7 bg-white border border-gray-200 rounded-xl px-2 py-1 text-gray-800">
                ({value}) {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KeywordFrequencyChart;
