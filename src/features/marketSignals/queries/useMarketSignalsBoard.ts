import { useEffect, useState } from "react";
import { useCollections } from "../../filters/CollectionsProvider";
import { useJobsSnapshot } from "../../jobs";
import { useMarketResearchListQuery } from "../../marketResearch/queries/useMarketResearchListQuery";
import { marketResearchKeys } from "../../marketResearch/queries/keys";
import { marketSignalsKeys } from "./keys";
import {
  createMarketResearch,
  getLatestMarketResearchSnapshotJobIds,
  updateMarketResearch,
  type MarketResearch,
} from "../../marketResearch";
import { DEFAULT_MARKET_SIGNAL_FILTERS } from "../constants";
import { filterSignalJobs } from "../model/filters";
import { buildPatternGroups } from "../model/patterns";
import { parseKeywordInput } from "../model/relevance";
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
import {
  loadMarketSignalOverrides,
  saveMarketSignalOverrides,
  upsertMarketSignalOverride,
} from "../storage";
import type {
  MarketSignalFilters,
  MarketSignalJob,
  MarketSignalOverride,
  MarketSignalsBoardConfig,
  MarketSignalsFocusMode,
} from "../types";
import { useMarketSignalsBoardQuery } from "./useMarketSignalsBoardQuery";

const PAGE_SIZE = 2000;

export const useMarketSignalsBoard = () => {
  const { collections } = useCollections();

  // Local UI state (focus, filters, selection, modals) - stays in the main hook
  const [marketResearchRecords, setMarketResearchRecords] = useState<
    MarketResearch[]
  >([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [researchError, setResearchError] = useState("");
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

  // Data layer: heavy fetching + computations now in dedicated query hook
  const jobsSnapshot = useJobsSnapshot({ pageSize: PAGE_SIZE });
  const marketResearchQuery = useMarketResearchListQuery();

  // Sync market research list (can be improved later with better invalidation)
  useEffect(() => {
    if (marketResearchQuery.data) {
      const records = marketResearchQuery.data;
      setMarketResearchRecords(records);
      setResearchError("");
      setActiveBoardId((currentId) =>
        currentId && records.some((record: MarketResearch) => record.id === currentId)
          ? currentId
          : records[0]?.id ?? null,
      );
    }
    if (marketResearchQuery.error) {
      setResearchError("Unable to load saved market research right now.");
    }
  }, [marketResearchQuery.data, marketResearchQuery.error]);

  const {
    boards,
    activeBoard,
    jobs,
    jobsSnapshot: jobsSnapshotData,
    signalJobs,
    patternGroups,
    summary,
    focusCounts,
    filteredSignalJobs,
    selectedJob,
    filterOptions,
    sourceCollectionName,
    isLoading: dataIsLoading,
    error: dataError,
  } = useMarketSignalsBoardQuery(
    marketResearchRecords,
    activeBoardId,
    jobsSnapshot,
    overrides,
    filters,
    focusMode,
    quickSearch,
    selectedJobId,
  );

  // Local UI effects
  useEffect(() => {
    if (!activeBoard) return;
    if (activeBoard.id !== activeBoardId) {
      setActiveBoardId(activeBoard.id);
    }
  }, [activeBoard, activeBoardId]);

  useEffect(() => {
    if (
      selectedJobId &&
      filteredSignalJobs.some((job) => job.jobId === selectedJobId)
    ) {
      return;
    }
    setSelectedJobId(filteredSignalJobs[0]?.jobId ?? null);
  }, [filteredSignalJobs, selectedJobId]);

  // Handlers (UI actions)
  const handleSelectBoard = (boardId: string) => {
    setActiveBoardId(boardId);
    setSelectedJobId(null);
  };

  const handleChangeBoard = async (nextBoard: MarketSignalsBoardConfig) => {
    const updatedResearch = await updateMarketResearch(nextBoard.id, {
      title: nextBoard.marketQuery || nextBoard.name,
      description: nextBoard.goal,
    });
    setMarketResearchRecords((records) =>
      records.map((record) =>
        record.id === updatedResearch.id ? updatedResearch : record,
      ),
    );
  };

  const handleCreateBoard = async () => {
    const index = marketResearchRecords.length + 1;
    const title = activeBoard?.marketQuery || `Market research ${index}`;
    const createdResearch = await createMarketResearch({
      title,
      description: activeBoard?.goal || "",
    });
    setMarketResearchRecords((records) => [...records, createdResearch]);
    setActiveBoardId(createdResearch.id);
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
    jobs,
    jobsSnapshot: jobsSnapshotData,
    error: researchError || dataError,
    filters,
    filterOptions,
    focusCounts,
    focusMode,
    isLoading: dataIsLoading,
    isSetupOpen,
    patternGroups,
    quickSearch,
    selectedJob,
    selectedJobId,
    showAdvancedFilters,
    signalJobs,
    sourceCollectionName,
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
