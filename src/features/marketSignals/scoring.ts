import type { PreparedUpworkJob } from "../../models";
import type {
  ExtractedSignalFields,
  RelevanceResult,
  SignalScoreBreakdown,
} from "./types";

const clampScore = (value: number) => Math.min(Math.max(value, 1), 5);

const roundToOneDecimal = (value: number) => Math.round(value * 10) / 10;

const average = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

const getBudgetStrength = (job: PreparedUpworkJob) => {
  if (job.fixedPriceValue != null) {
    if (job.fixedPriceValue >= 1000) return 5;
    if (job.fixedPriceValue >= 500) return 4;
    if (job.fixedPriceValue >= 100) return 3;
    return 2;
  }
  if (job.hourlyRateAverage != null) {
    if (job.hourlyRateAverage >= 75) return 5;
    if (job.hourlyRateAverage >= 45) return 4;
    if (job.hourlyRateAverage >= 20) return 3;
    return 2;
  }
  if (job.total_spent != null && job.total_spent >= 1000) return 3;
  return 2;
};

const getClientStrength = (job: PreparedUpworkJob) => {
  let score = 2;
  if (job.total_spent != null) {
    if (job.total_spent >= 10000) score += 2;
    else if (job.total_spent >= 1000) score += 1;
  }
  if (job.client_rating != null && job.client_rating >= 4.5) score += 1;
  return clampScore(score);
};

const getUrgencyStrength = (urgencySignal: string) =>
  urgencySignal === "No urgency found" ? 2 : 5;

const getProblemClarity = (fields: ExtractedSignalFields) => {
  if (!fields.problem || fields.problem === "Unknown") return 1;
  if (fields.problem.length >= 35) return 4;
  return 3;
};

const getSkillMatch = (fields: ExtractedSignalFields) => {
  const signals = fields.requiredSkills.length + fields.relatedTools.length;
  if (signals >= 5) return 5;
  if (signals >= 3) return 4;
  if (signals >= 1) return 3;
  return 2;
};

export const getRepeatabilityScore = (patternJobCount: number) => {
  if (patternJobCount >= 5) return 5;
  if (patternJobCount >= 3) return 4;
  if (patternJobCount >= 2) return 3;
  return 2;
};

export const scoreSignalJob = (
  job: PreparedUpworkJob,
  relevance: RelevanceResult,
  fields: ExtractedSignalFields,
  patternJobCount: number,
) => {
  const breakdown: SignalScoreBreakdown = {
    relevanceScore: relevance.relevanceScore,
    budgetStrength: getBudgetStrength(job),
    clientStrength: getClientStrength(job),
    urgencyStrength: getUrgencyStrength(fields.urgencySignal),
    problemClarity: getProblemClarity(fields),
    skillMatch: getSkillMatch(fields),
    speedToValue: fields.speedToValue,
    repeatability: getRepeatabilityScore(patternJobCount),
    difficultyAdjusted: clampScore(6 - fields.difficulty),
  };

  const marketSignalScore = roundToOneDecimal(
    average(Object.values(breakdown)),
  );

  return {
    marketSignalScore,
    scoreBreakdown: breakdown,
  };
};

