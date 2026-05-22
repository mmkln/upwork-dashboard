import { useEffect, useMemo, useState } from "react";
import { useCollections } from "../../filters/CollectionsProvider";
import { useJobsSnapshot } from "../../jobs";
import {
  createMarketResearch,
  fetchMarketResearchList,
  getLatestMarketResearchSnapshotJobIds,
  updateMarketResearch,
  type MarketResearch,
} from "../../marketResearch";
import { DEFAULT_MARKET_SIGNAL_FILTERS } from "../constants";
import { filterSignalJobs } from "../filters";
import { buildPatternGroups } from "../patterns";
import { parseKeywordInput } from "../relevance";
import {
  buildMarketSignalJobs,
  getSignalSummary,
  getUniqueSignalValues,
} from "../selectors";
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
} from "../types";

export type MarketSignalsFocusMode =
  | "priority"
  | "review"
  | "corrected"
  | "patterns"
  | "all";

const PAGE_SIZE = 2000;

const mapMarketResearchToBoard = (
  research: MarketResearch,
): MarketSignalsBoardConfig => ({
  id: research.id,
  owner: research.owner,
  name: research.title,
  goal: research.description,
  marketQuery: research.title,
  jobsSnapshot: getLatestMarketResearchSnapshotJobIds(research),
  includeKeywords: parseKeywordInput(research.title.replace(/\s+/g, ",")),
  excludeKeywords: [],
  createdAt: research.created_at,
  updatedAt: research.updated_at,
});

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

const getSnapshotLabel = (board: MarketSignalsBoardConfig | null) => {
  if (!board) return "No research selected";
  return `${board.jobsSnapshot.length.toLocaleString()} saved jobs`;
};

export const useMarketSignalsBoard = () => {
  const { collections } = useCollections();
  const jobsSnapshot = useJobsSnapshot({ pageSize: PAGE_SIZE });
  const [marketResearchRecords, setMarketResearchRecords] = useState<
    MarketResearch[]
  >([]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [researchError, setResearchError] = useState("");
  const [isResearchLoading, setIsResearchLoading] = useState(true);
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

  useEffect(() => {
    let isMounted = true;
    setIsResearchLoading(true);
    fetchMarketResearchList()
      .then((records) => {
        if (!isMounted) return;
        setMarketResearchRecords(records);
        setResearchError("");
        setActiveBoardId((currentId) =>
          currentId && records.some((record) => record.id === currentId)
            ? currentId
            : records[0]?.id ?? null,
        );
      })
      .catch(() => {
        if (!isMounted) return;
        setResearchError("Unable to load saved market research right now.");
      })
      .finally(() => {
        if (isMounted) {
          setIsResearchLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const boards = useMemo(
    () => marketResearchRecords.map(mapMarketResearchToBoard),
    [marketResearchRecords],
  );

  const activeBoard = useMemo(() => {
    return (
      boards.find((board) => board.id === activeBoardId) ?? boards[0] ?? null
    );
  }, [activeBoardId, boards]);

  useEffect(() => {
    if (!activeBoard) return;
    if (activeBoard.id !== activeBoardId) {
      setActiveBoardId(activeBoard.id);
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
    jobs: jobsSnapshot.jobs,
    jobsSnapshot,
    error: researchError || (jobsSnapshot.error
      ? "Unable to load market signals right now."
      : ""),
    filters,
    filterOptions,
    focusCounts,
    focusMode,
    isLoading: isResearchLoading || jobsSnapshot.isLoading,
    isSetupOpen,
    patternGroups,
    quickSearch,
    selectedJob,
    selectedJobId,
    showAdvancedFilters,
    signalJobs,
    sourceCollectionName: getSnapshotLabel(activeBoard),
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
