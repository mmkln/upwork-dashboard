import React from "react";
import { UpworkJob } from "../../models";
import Card from "../ui/Card";
import { CopyToClipboardButton } from "../elements";
import { Badge } from "../ui";

interface KeywordFrequencyChartProps {
  jobs: UpworkJob[];
  limit?: number;
  getText?: (job: UpworkJob) => string;
  headingFormatter?: (count: number) => string;
  copyName?: string;
}

const roundToSignificant = (num: number): number => {
  if (num < 10) return 10;
  const power = Math.pow(10, Math.floor(Math.log10(num)));
  return Math.ceil(num / power) * power;
};

const SKIP_WORDS = [
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

const DEFAULT_TEXT_SELECTOR = (job: UpworkJob) =>
  `${job.title ?? ""} ${job.description ?? ""}`;

const getKeywordFrequency = (
  jobs: UpworkJob[],
  textSelector: (job: UpworkJob) => string,
): { [key: string]: number } => {
  return jobs.reduce((acc: { [key: string]: number }, job) => {
    const keywords = (textSelector(job) || "")
      .toLowerCase()
      .match(/\b\w+\b/g);
    if (keywords) {
      keywords.forEach((word) => {
        if (!SKIP_WORDS.includes(word)) {
          acc[word] = (acc[word] || 0) + 1;
        }
      });
    }
    return acc;
  }, {});
};

const KeywordFrequencyChart: React.FC<KeywordFrequencyChartProps> = ({
  jobs,
  limit,
  getText = DEFAULT_TEXT_SELECTOR,
  headingFormatter = (count) => `Top ${count} Keywords`,
  copyName = "Keywords",
}) => {
  const keywordData = getKeywordFrequency(jobs, getText);

  const data = Object.keys(keywordData).map((keyword) => ({
    label: keyword,
    value: keywordData[keyword],
  }));

  const maxFrequency = roundToSignificant(
    Math.max(...data.map((item) => item.value), 0),
  );

  const sortedData = data.sort((a, b) => b.value - a.value);
  const limitedData = limit ? sortedData.slice(0, limit) : sortedData;

  const keywordsText = limitedData.map((item) => item.label).join(", ");

  const headingText = headingFormatter(limitedData.length);

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">{headingText}</h2>
          <CopyToClipboardButton data={keywordsText} name={copyName} />
        </div>
        <div className="flex flex-wrap gap-2">
          {limitedData.map(({ label, value }) => (
            <Badge
              key={label}
              label={label}
              value={value}
              maxRate={maxFrequency}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default KeywordFrequencyChart;
