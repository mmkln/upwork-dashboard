import type { PreparedUpworkJob } from "../../models";
import type { MarketSignalsBoardConfig, RelevanceResult } from "./types";

const normalizeKeyword = (keyword: string) => keyword.trim().toLowerCase();

export const parseKeywordInput = (value: string): string[] =>
  value
    .split(",")
    .map(normalizeKeyword)
    .filter(Boolean);

const deriveQueryKeywords = (query: string): string[] =>
  query
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/i)
    .map((item) => item.trim())
    .filter((item) => item.length >= 3);

const getIncludeKeywords = (board: MarketSignalsBoardConfig) => {
  const configured = board.includeKeywords.map(normalizeKeyword).filter(Boolean);
  if (configured.length) return configured;
  return deriveQueryKeywords(board.marketQuery);
};

const findMatches = (text: string, keywords: string[]) =>
  keywords.filter((keyword) => keyword && text.includes(keyword));

export const classifyRelevance = (
  job: PreparedUpworkJob,
  board: MarketSignalsBoardConfig,
): RelevanceResult => {
  const text = job.searchableText.toLowerCase();
  const includeKeywords = getIncludeKeywords(board);
  const excludeKeywords = board.excludeKeywords
    .map(normalizeKeyword)
    .filter(Boolean);
  const matchedIncludeKeywords = findMatches(text, includeKeywords);
  const matchedExcludeKeywords = findMatches(text, excludeKeywords);
  const skillMatches = includeKeywords.filter((keyword) =>
    job.skillsLowerSet.has(keyword),
  );
  const totalIncludeSignals = new Set([
    ...matchedIncludeKeywords,
    ...skillMatches,
  ]).size;

  if (matchedExcludeKeywords.length) {
    return {
      relevanceStatus: "Irrelevant",
      relevanceScore: 1,
      matchedIncludeKeywords,
      matchedExcludeKeywords,
      relevanceReason: "Matched exclude keywords.",
    };
  }

  if (totalIncludeSignals >= 2) {
    return {
      relevanceStatus: "Relevant",
      relevanceScore: 5,
      matchedIncludeKeywords,
      matchedExcludeKeywords: [],
      relevanceReason: "Matched multiple include keywords or skills.",
    };
  }

  if (totalIncludeSignals === 1) {
    return {
      relevanceStatus: "Maybe Relevant",
      relevanceScore: 3,
      matchedIncludeKeywords,
      matchedExcludeKeywords: [],
      relevanceReason: "Matched one include keyword or skill.",
    };
  }

  return {
    relevanceStatus: "Irrelevant",
    relevanceScore: 1,
    matchedIncludeKeywords: [],
    matchedExcludeKeywords: [],
    relevanceReason: "No meaningful match for this board query.",
  };
};

