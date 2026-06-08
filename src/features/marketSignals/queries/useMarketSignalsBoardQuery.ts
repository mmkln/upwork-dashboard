import { useMemo } from "react";
import { useJobsSnapshot } from "../../jobs";
import { useMarketResearchListQuery } from "../../marketResearch/queries/useMarketResearchListQuery";
import { marketResearchKeys } from "../../marketResearch/queries/keys";
import { marketSignalsKeys } from "./keys";
import type {
  MarketSignalJob,
  MarketSignalsBoardConfig,
  MarketSignalsFocusMode,
  MarketSignalFilters,
} from "../types";
import { filterSignalJobs } from "../model/filters";
import { buildPatternGroups } from "../model/patterns";
import {
  buildMarketSignalJobs,
  getSignalSummary,
  getUniqueSignalValues,
} from "../model/selectors";
import {
  mapMarketResearchToBoard,
  sortSignalJobs,
  getFocusJobs,
  getSnapshotLabel,
} from "../model/board";
import type { MarketResearch } from "../../marketResearch";

const PAGE_SIZE = 2000;

export interface MarketSignalsBoardData {
  boards: MarketSignalsBoardConfig[];
  activeBoard: MarketSignalsBoardConfig | null;
  jobs: any[]; // PreparedUpworkJob[]
  jobsSnapshot: any; // from useJobsSnapshot
  signalJobs: MarketSignalJob[];
  patternGroups: any[];
  summary: any;
  focusCounts: Record<MarketSignalsFocusMode | "all", number>;
  filteredSignalJobs: MarketSignalJob[];
  selectedJob: MarketSignalJob | null;
  filterOptions: any;
  sourceCollectionName: string;
  isLoading: boolean;
  error: string;
}

/**
 * Data query hook for Market Signals Board.
 * Handles fetching jobs snapshot + market research, heavy client-side processing,
 * and derived state. Uses TanStack Query patterns for caching/cancellation.
 *
 * This separates data concerns from local UI state (focus, filters, selection).
 */
export const useMarketSignalsBoardQuery = (
  marketResearchRecords: MarketResearch[],
  activeBoardId: string | null,
  jobsSnapshot: ReturnType<typeof useJobsSnapshot>,
  overrides: any[],
  filters: MarketSignalFilters,
  focusMode: MarketSignalsFocusMode,
  quickSearch: string,
  selectedJobId: string | null,
): MarketSignalsBoardData => {
  const marketResearchQuery = useMarketResearchListQuery();

  const boards = useMemo(
    () => marketResearchRecords.map(mapMarketResearchToBoard),
    [marketResearchRecords],
  );

  const activeBoard = useMemo(() => {
    return (
      boards.find((board) => board.id === activeBoardId) ?? boards[0] ?? null
    );
  }, [activeBoardId, boards]);

  const signalJobs = useMemo(() => {
    if (!activeBoard) return [];
    return buildMarketSignalJobs(jobsSnapshot.jobs, activeBoard, overrides);
  }, [activeBoard, jobsSnapshot.jobs, overrides]);

  const patternGroups = useMemo(
    () => buildPatternGroups(signalJobs),
    [signalJobs],
  );

  const summary = useMemo(() => getSignalSummary(signalJobs), [signalJobs]);

  const focusCounts = useMemo(
    () => ({
      priority: getFocusJobs(signalJobs, "priority").length,
      review: getFocusJobs(signalJobs, "review").length,
      corrected: getFocusJobs(signalJobs, "corrected").length,
      patterns: patternGroups.length,
      all: signalJobs.length,
    }),
    [patternGroups.length, signalJobs],
  );

  const focusedSignalJobs = useMemo(
    () => getFocusJobs(signalJobs, focusMode),
    [focusMode, signalJobs],
  );

  const combinedFilters = useMemo(
    () => ({
      ...filters,
      keyword: quickSearch || filters.keyword,
    }),
    [filters, quickSearch],
  );

  const filteredSignalJobs = useMemo(
    () => sortSignalJobs(filterSignalJobs(focusedSignalJobs, combinedFilters)),
    [combinedFilters, focusedSignalJobs],
  );

  const selectedJob = useMemo(() => {
    if (!selectedJobId) return null;
    return signalJobs.find((job) => job.jobId === selectedJobId) ?? null;
  }, [selectedJobId, signalJobs]);

  const filterOptions = useMemo(
    () => ({
      requestCategories: getUniqueSignalValues(
        signalJobs,
        (job) => job.requestCategory,
      ),
      clientTypes: getUniqueSignalValues(signalJobs, (job) => job.clientType),
      buyerNeeds: getUniqueSignalValues(signalJobs, (job) => job.buyerNeed),
      skills: getUniqueSignalValues(signalJobs, (job) => job.requiredSkills),
      tools: getUniqueSignalValues(signalJobs, (job) => job.relatedTools),
    }),
    [signalJobs],
  );

  const sourceCollectionName = getSnapshotLabel(activeBoard);

  const isLoading =
    marketResearchQuery.isLoading ||
    marketResearchQuery.isFetching ||
    jobsSnapshot.isLoading;

  const error = marketResearchQuery.error
    ? "Unable to load saved market research right now."
    : jobsSnapshot.error
    ? "Unable to load market signals right now."
    : "";

  return {
    boards,
    activeBoard,
    jobs: jobsSnapshot.jobs,
    jobsSnapshot,
    signalJobs,
    patternGroups,
    summary,
    focusCounts,
    filteredSignalJobs,
    selectedJob,
    filterOptions,
    sourceCollectionName,
    isLoading,
    error,
  };
};
