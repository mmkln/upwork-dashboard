import { useEffect, useMemo, useState } from "react";
import { useCollections } from "../../filters/CollectionsProvider";
import { useJobsSnapshot } from "../../jobs";
import {
  DEFAULT_MARKET_SIGNAL_BOARD,
  DEFAULT_MARKET_SIGNAL_FILTERS,
} from "../constants";
import { filterSignalJobs } from "../filters";
import { buildPatternGroups } from "../patterns";
import {
  buildMarketSignalJobs,
  getSignalSummary,
  getUniqueSignalValues,
} from "../selectors";
import {
  loadActiveMarketSignalBoardId,
  loadMarketSignalBoards,
  loadMarketSignalOverrides,
  saveActiveMarketSignalBoardId,
  saveMarketSignalBoards,
  saveMarketSignalOverrides,
  upsertMarketSignalOverride,
} from "../storage";
import type {
  MarketSignalFilters,
  MarketSignalJob,
  MarketSignalOverride,
  MarketSignalsBoardConfig,
} from "../types";

export type MarketSignalsFocusMode =
  | "priority"
  | "review"
  | "corrected"
  | "patterns"
  | "all";

const PAGE_SIZE = 2000;

const createBoardId = () => `market-signals-${Date.now()}`;

const createNewBoard = (
  index: number,
  baseBoard: MarketSignalsBoardConfig = DEFAULT_MARKET_SIGNAL_BOARD,
): MarketSignalsBoardConfig => {
  const now = new Date().toISOString();

  return {
    ...baseBoard,
    id: createBoardId(),
    name: baseBoard.marketQuery || `Market Signals Board ${index}`,
    createdAt: now,
    updatedAt: now,
  };
};

const sortSignalJobs = (jobs: MarketSignalJob[]) =>
  [...jobs].sort((a, b) => {
    const relevanceRank = {
      Relevant: 0,
      "Maybe Relevant": 1,
      Irrelevant: 2,
    };
    const relevanceDelta =
      relevanceRank[a.relevanceStatus] - relevanceRank[b.relevanceStatus];
    if (relevanceDelta !== 0) return relevanceDelta;
    if (b.marketSignalScore !== a.marketSignalScore) {
      return b.marketSignalScore - a.marketSignalScore;
    }
    return (
      new Date(b.sourceJob.created_at).getTime() -
      new Date(a.sourceJob.created_at).getTime()
    );
  });

const getFocusJobs = (
  jobs: MarketSignalJob[],
  focusMode: MarketSignalsFocusMode,
) => {
  if (focusMode === "priority") {
    return jobs.filter(
      (job) => job.relevanceStatus === "Relevant" && job.marketSignalScore >= 4,
    );
  }
  if (focusMode === "review") {
    return jobs.filter(
      (job) =>
        job.relevanceStatus !== "Irrelevant" && job.userCorrections == null,
    );
  }
  if (focusMode === "corrected") {
    return jobs.filter((job) => job.userCorrections != null);
  }
  return jobs;
};

const getSourceCollectionName = (
  board: MarketSignalsBoardConfig | undefined,
  collections: Array<{ id: number; name: string }>,
) => {
  if (!board || board.sourceCollectionId == null) return "All collections";
  return (
    collections.find((collection) => collection.id === board.sourceCollectionId)
      ?.name ?? "Selected collection"
  );
};

export const useMarketSignalsBoard = () => {
  const { collections } = useCollections();
  const jobsSnapshot = useJobsSnapshot({ pageSize: PAGE_SIZE });
  const [boards, setBoards] = useState<MarketSignalsBoardConfig[]>(() =>
    loadMarketSignalBoards(),
  );
  const [activeBoardId, setActiveBoardId] = useState(() =>
    loadActiveMarketSignalBoardId(),
  );
  const [overrides, setOverrides] = useState<MarketSignalOverride[]>(() =>
    loadMarketSignalOverrides(),
  );
  const [filters, setFilters] = useState<MarketSignalFilters>(
    DEFAULT_MARKET_SIGNAL_FILTERS,
  );
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [focusMode, setFocusMode] =
    useState<MarketSignalsFocusMode>("priority");
  const [quickSearch, setQuickSearch] = useState("");

  const activeBoard = useMemo(() => {
    return boards.find((board) => board.id === activeBoardId) ?? boards[0];
  }, [activeBoardId, boards]);

  useEffect(() => {
    if (!activeBoard) return;
    if (activeBoard.id !== activeBoardId) {
      setActiveBoardId(activeBoard.id);
      saveActiveMarketSignalBoardId(activeBoard.id);
    }
  }, [activeBoard, activeBoardId]);

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

  useEffect(() => {
    if (
      selectedJobId &&
      filteredSignalJobs.some((job) => job.jobId === selectedJobId)
    ) {
      return;
    }
    setSelectedJobId(filteredSignalJobs[0]?.jobId ?? null);
  }, [filteredSignalJobs, selectedJobId]);

  const handleSelectBoard = (boardId: string) => {
    setActiveBoardId(boardId);
    saveActiveMarketSignalBoardId(boardId);
    setSelectedJobId(null);
  };

  const handleChangeBoard = (nextBoard: MarketSignalsBoardConfig) => {
    const nextBoards = boards.map((board) =>
      board.id === nextBoard.id ? nextBoard : board,
    );
    setBoards(nextBoards);
    saveMarketSignalBoards(nextBoards);
  };

  const handleCreateBoard = () => {
    const nextBoard = createNewBoard(boards.length + 1, activeBoard);
    const nextBoards = [...boards, nextBoard];
    setBoards(nextBoards);
    saveMarketSignalBoards(nextBoards);
    setActiveBoardId(nextBoard.id);
    saveActiveMarketSignalBoardId(nextBoard.id);
    setSelectedJobId(null);
  };

  const handleSaveOverride = (override: MarketSignalOverride) => {
    const nextOverrides = upsertMarketSignalOverride(overrides, override);
    setOverrides(nextOverrides);
    saveMarketSignalOverrides(nextOverrides);
  };

  return {
    activeBoard,
    boards,
    collections,
    jobs: jobsSnapshot.jobs,
    jobsSnapshot,
    error: jobsSnapshot.error
      ? "Unable to load market signals right now."
      : "",
    filters,
    filterOptions,
    focusCounts,
    focusMode,
    isLoading: jobsSnapshot.isLoading,
    isSetupOpen,
    patternGroups,
    quickSearch,
    selectedJob,
    selectedJobId,
    showAdvancedFilters,
    signalJobs,
    sourceCollectionName: getSourceCollectionName(activeBoard, collections),
    summary,
    filteredSignalJobs,
    handleChangeBoard,
    handleCreateBoard,
    handleSaveOverride,
    handleSelectBoard,
    setFilters,
    setFocusMode,
    setIsSetupOpen,
    setQuickSearch,
    setSelectedJobId,
    setShowAdvancedFilters,
  };
};
