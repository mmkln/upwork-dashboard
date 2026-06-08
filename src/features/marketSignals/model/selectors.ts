import type { PreparedUpworkJob } from "../../../models";
import { classifyRelevance } from "./relevance";
import { extractSignalFields } from "./extraction";
import { getMarketSignalPatternKey, getPatternJobCounts } from "./patterns";
import { scoreSignalJob } from "./scoring";
import type {
  MarketSignalJob,
  MarketSignalOverride,
  MarketSignalsBoardConfig,
} from "../types";

const matchesJobsSnapshot = (
  job: PreparedUpworkJob,
  board: MarketSignalsBoardConfig,
) => {
  if (board.jobsSnapshot.length === 0) return false;
  return board.jobsSnapshot.includes(job.id);
};

const applyOverride = (
  job: MarketSignalJob,
  override: MarketSignalOverride | undefined,
): MarketSignalJob => {
  if (!override) {
    return {
      ...job,
      userCorrections: null,
    };
  }
  const { updatedAt, ...overrideFields } = override;
  return {
    ...job,
    ...overrideFields,
    sourceJob: job.sourceJob,
    scoreBreakdown: job.scoreBreakdown,
    auto: job.auto,
    userCorrections: overrideFields,
  };
};

export const buildMarketSignalJobs = (
  jobs: PreparedUpworkJob[],
  board: MarketSignalsBoardConfig,
  overrides: MarketSignalOverride[],
) => {
  const sourceJobs = jobs.filter((job) => matchesJobsSnapshot(job, board));
  const initialSignals = sourceJobs.map((job) => {
    const relevance = classifyRelevance(job, board);
    const fields = extractSignalFields(job, relevance);
    const patternGroup = getMarketSignalPatternKey(fields);

    const auto = {
      ...relevance,
      ...fields,
      patternGroup,
      marketSignalScore: relevance.relevanceScore,
      scoreBreakdown: {
        relevanceScore: relevance.relevanceScore,
        budgetStrength: 1,
        clientStrength: 1,
        urgencyStrength: 1,
        problemClarity: 1,
        skillMatch: 1,
        speedToValue: fields.speedToValue,
        repeatability: 1,
        difficultyAdjusted: 1,
      },
    };

    return {
      jobId: job.id,
      boardId: board.id,
      sourceJob: job,
      ...auto,
      auto,
      userCorrections: null,
    };
  });
  const patternCounts = getPatternJobCounts(initialSignals);
  const scopedOverrides = overrides.filter((item) => item.boardId === board.id);

  return initialSignals.map((signal) => {
    const score = scoreSignalJob(
      signal.sourceJob,
      signal,
      signal,
      patternCounts[signal.patternGroup] ?? 1,
    );
    const auto = {
      ...signal,
      ...score,
    };
    const scoredSignal = {
      ...auto,
      auto: {
        ...signal.auto,
        ...score,
      },
      userCorrections: null,
    };
    const override = scopedOverrides.find(
      (item) => item.jobId === signal.jobId,
    );
    return applyOverride(scoredSignal, override);
  });
};

export const getUniqueSignalValues = (
  jobs: MarketSignalJob[],
  getValues: (job: MarketSignalJob) => string | string[],
) => {
  const values = new Set<string>();
  jobs.forEach((job) => {
    const result = getValues(job);
    const nextValues = Array.isArray(result) ? result : [result];
    nextValues.forEach((value) => {
      if (value) values.add(value);
    });
  });
  return Array.from(values).sort((a, b) => a.localeCompare(b));
};

export const getSignalSummary = (jobs: MarketSignalJob[]) => {
  const relevantJobs = jobs.filter((job) => job.relevanceStatus === "Relevant");
  const maybeRelevantJobs = jobs.filter(
    (job) => job.relevanceStatus === "Maybe Relevant",
  );
  const irrelevantJobs = jobs.filter(
    (job) => job.relevanceStatus === "Irrelevant",
  );
  const strongSignals = jobs.filter(
    (job) =>
      job.relevanceStatus === "Relevant" && job.marketSignalScore >= 4,
  );
  const scoredJobs = jobs.filter((job) => job.relevanceStatus !== "Irrelevant");
  const averageMarketSignalScore = scoredJobs.length
    ? scoredJobs.reduce((sum, job) => sum + job.marketSignalScore, 0) /
      scoredJobs.length
    : 0;

  return {
    totalJobs: jobs.length,
    relevantJobs: relevantJobs.length,
    maybeRelevantJobs: maybeRelevantJobs.length,
    irrelevantJobs: irrelevantJobs.length,
    strongSignals: strongSignals.length,
    averageMarketSignalScore,
  };
};
