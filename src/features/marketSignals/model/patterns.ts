import type {
  MarketSignalJob,
  MarketSignalPatternGroup,
  PatternStrength,
} from "../types";

const getPatternKey = (job: Pick<
  MarketSignalJob,
  "requestCategory" | "clientType" | "buyerNeed"
>) => [job.requestCategory, job.clientType, job.buyerNeed].join(" | ");

const getTopValues = (values: string[], limit: number) => {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    if (!value) return acc;
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value]) => value);
};

const getPatternStrength = (
  jobCount: number,
  averageMarketSignalScore: number,
): PatternStrength => {
  if (jobCount >= 5 && averageMarketSignalScore >= 4) return "Strong";
  if (jobCount >= 3 && averageMarketSignalScore >= 3) return "Medium";
  return "Weak";
};

export const buildPatternGroups = (
  jobs: MarketSignalJob[],
): MarketSignalPatternGroup[] => {
  const groupedJobs = jobs
    .filter((job) => job.relevanceStatus !== "Irrelevant")
    .reduce<Record<string, MarketSignalJob[]>>((acc, job) => {
      const key = getPatternKey(job);
      acc[key] = [...(acc[key] ?? []), job];
      return acc;
    }, {});

  return Object.entries(groupedJobs)
    .map(([patternName, items], index) => {
      const scoreTotal = items.reduce(
        (sum, item) => sum + item.marketSignalScore,
        0,
      );
      const budgets = items
        .map((item) => item.sourceJob.fixedPriceValue)
        .filter((value): value is number => value != null);
      const averageBudget = budgets.length
        ? budgets.reduce((sum, value) => sum + value, 0) / budgets.length
        : null;
      const averageMarketSignalScore = scoreTotal / items.length;

      return {
        patternId: `pattern-${index}-${patternName}`,
        patternName,
        requestCategory: items[0].requestCategory,
        clientType: items[0].clientType,
        buyerNeed: items[0].buyerNeed,
        jobCount: items.length,
        averageBudget,
        averageMarketSignalScore,
        commonSkills: getTopValues(
          items.flatMap((item) => item.requiredSkills),
          5,
        ),
        commonTools: getTopValues(
          items.flatMap((item) => item.relatedTools),
          5,
        ),
        exampleJobIds: items.slice(0, 3).map((item) => item.jobId),
        patternStrength: getPatternStrength(
          items.length,
          averageMarketSignalScore,
        ),
      };
    })
    .sort((a, b) => {
      if (b.jobCount !== a.jobCount) return b.jobCount - a.jobCount;
      return b.averageMarketSignalScore - a.averageMarketSignalScore;
    });
};

export const getPatternJobCounts = (jobs: MarketSignalJob[]) =>
  jobs.reduce<Record<string, number>>((acc, job) => {
    if (job.relevanceStatus === "Irrelevant") return acc;
    const key = getPatternKey(job);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

export const getMarketSignalPatternKey = getPatternKey;

