import type { PreparedUpworkJob } from "../../models";

export type RelevanceStatus = "Relevant" | "Maybe Relevant" | "Irrelevant";

export type PatternStrength = "Weak" | "Medium" | "Strong";

export type MarketSignalsBoardConfig = {
  id: string;
  owner: number | null;
  name: string;
  goal: string;
  marketQuery: string;
  jobsSnapshot: string[];
  includeKeywords: string[];
  excludeKeywords: string[];
  createdAt: string;
  updatedAt: string;
};

export type RelevanceResult = {
  relevanceStatus: RelevanceStatus;
  relevanceScore: number;
  matchedIncludeKeywords: string[];
  matchedExcludeKeywords: string[];
  relevanceReason: string;
};

export type ExtractedSignalFields = {
  requestCategory: string;
  clientType: string;
  niche: string;
  problem: string;
  exactClientLanguage: string;
  buyerNeed: string;
  budgetSignal: string;
  urgencySignal: string;
  requiredSkills: string[];
  relatedTools: string[];
  difficulty: number;
  speedToValue: number;
  patternGroup: string;
  notes: string;
};

export type SignalScoreBreakdown = {
  relevanceScore: number;
  budgetStrength: number;
  clientStrength: number;
  urgencyStrength: number;
  problemClarity: number;
  skillMatch: number;
  speedToValue: number;
  repeatability: number;
  difficultyAdjusted: number;
};

export type MarketSignalJob = RelevanceResult &
  ExtractedSignalFields & {
    jobId: string;
    boardId: string;
    sourceJob: PreparedUpworkJob;
    marketSignalScore: number;
    scoreBreakdown: SignalScoreBreakdown;
    auto: AutoMarketSignalSnapshot;
    userCorrections: MarketSignalUserCorrections | null;
  };

export type AutoMarketSignalSnapshot = RelevanceResult &
  ExtractedSignalFields & {
    marketSignalScore: number;
    scoreBreakdown: SignalScoreBreakdown;
  };

export type MarketSignalUserCorrections = Partial<
  Pick<
    MarketSignalJob,
    | "relevanceStatus"
    | "requestCategory"
    | "clientType"
    | "niche"
    | "problem"
    | "exactClientLanguage"
    | "buyerNeed"
    | "budgetSignal"
    | "urgencySignal"
    | "requiredSkills"
    | "relatedTools"
    | "difficulty"
    | "speedToValue"
    | "marketSignalScore"
    | "patternGroup"
    | "notes"
  >
>;

export type MarketSignalOverride = MarketSignalUserCorrections & {
  jobId: string;
  boardId: string;
  updatedAt: string;
};

export type MarketSignalFilters = {
  keyword: string;
  relevanceStatus: RelevanceStatus | "All";
  requestCategory: string;
  clientType: string;
  buyerNeed: string;
  requiredSkill: string;
  relatedTool: string;
  minimumScore: number;
};

export type MarketSignalPatternGroup = {
  patternId: string;
  patternName: string;
  requestCategory: string;
  clientType: string;
  buyerNeed: string;
  jobCount: number;
  averageBudget: number | null;
  averageMarketSignalScore: number;
  commonSkills: string[];
  commonTools: string[];
  exampleJobIds: string[];
  patternStrength: PatternStrength;
};
