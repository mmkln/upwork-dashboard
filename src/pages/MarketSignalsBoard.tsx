import React, { useEffect, useMemo, useState } from "react";
import { Badge, EmptyState } from "../shared/ui";
import { fetchAllUpworkJobs } from "../services";
import type { PreparedUpworkJob, UpworkJob } from "../models";
import { prepareJobs } from "../utils";
import { useCollections } from "../features";
import {
  DEFAULT_MARKET_SIGNAL_BOARD,
  DEFAULT_MARKET_SIGNAL_FILTERS,
  buildMarketSignalJobs,
  buildPatternGroups,
  filterSignalJobs,
  getSignalSummary,
  getUniqueSignalValues,
  loadActiveMarketSignalBoardId,
  loadMarketSignalBoards,
  loadMarketSignalOverrides,
  saveActiveMarketSignalBoardId,
  saveMarketSignalBoards,
  saveMarketSignalOverrides,
  upsertMarketSignalOverride,
  type MarketSignalFilters,
  type MarketSignalJob,
  type MarketSignalOverride,
  type MarketSignalsBoardConfig,
} from "../features/marketSignals";
import {
  BoardSettings,
  PatternGroupsPanel,
  SignalFilterBar,
  SignalJobDetailPanel,
  SignalJobsTable,
  SignalSummaryCounters,
} from "../features/marketSignals/components";

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
    name: `Market Signals Board ${index}`,
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

const MarketSignalsBoard: React.FC = () => {
  const { collections } = useCollections();
  const [jobs, setJobs] = useState<PreparedUpworkJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
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

  useEffect(() => {
    let cancelled = false;

    const loadJobs = async () => {
      setIsLoading(true);
      setError("");
      try {
        const result: UpworkJob[] = await fetchAllUpworkJobs(PAGE_SIZE);
        if (!cancelled) {
          setJobs(prepareJobs(result));
        }
      } catch (loadError) {
        console.error("Unable to load market signals:", loadError);
        if (!cancelled) {
          setError("Unable to load market signals right now.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      cancelled = true;
    };
  }, []);

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
    return buildMarketSignalJobs(jobs, activeBoard, overrides);
  }, [activeBoard, jobs, overrides]);

  const patternGroups = useMemo(
    () => buildPatternGroups(signalJobs),
    [signalJobs],
  );

  const summary = useMemo(() => getSignalSummary(signalJobs), [signalJobs]);

  const filteredSignalJobs = useMemo(
    () => sortSignalJobs(filterSignalJobs(signalJobs, filters)),
    [filters, signalJobs],
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

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Badge tone="info">Market intelligence</Badge>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">
              Market Signals Board
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-text-secondary">
              Convert scraped jobs into relevant signals, comparable buyer
              problems, ranked opportunities, and repeated market patterns.
            </p>
          </div>
        </div>
      </div>

      {activeBoard ? (
        <>
          <BoardSettings
            boards={boards}
            activeBoard={activeBoard}
            collections={collections}
            onSelectBoard={handleSelectBoard}
            onCreateBoard={handleCreateBoard}
            onChangeBoard={handleChangeBoard}
          />

          {error ? (
            <EmptyState title="Signals unavailable" description={error} />
          ) : null}

          <SignalSummaryCounters
            totalJobs={summary.totalJobs}
            relevantJobs={summary.relevantJobs}
            maybeRelevantJobs={summary.maybeRelevantJobs}
            irrelevantJobs={summary.irrelevantJobs}
            strongSignals={summary.strongSignals}
            patternGroups={patternGroups.length}
            averageMarketSignalScore={summary.averageMarketSignalScore}
            isLoading={isLoading}
          />

          <SignalFilterBar
            filters={filters}
            requestCategories={filterOptions.requestCategories}
            clientTypes={filterOptions.clientTypes}
            buyerNeeds={filterOptions.buyerNeeds}
            skills={filterOptions.skills}
            tools={filterOptions.tools}
            onChange={setFilters}
          />

          <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="flex flex-col gap-4">
              <SignalJobsTable
                jobs={filteredSignalJobs}
                selectedJobId={selectedJobId}
                isLoading={isLoading}
                onSelectJob={(job) => setSelectedJobId(job.jobId)}
              />
              <PatternGroupsPanel patterns={patternGroups} />
            </div>
            <SignalJobDetailPanel
              job={selectedJob}
              onSaveOverride={handleSaveOverride}
            />
          </div>
        </>
      ) : (
        <EmptyState
          title="No board configured"
          description="Create a board to start classifying market signals."
        />
      )}
    </div>
  );
};

export default MarketSignalsBoard;
