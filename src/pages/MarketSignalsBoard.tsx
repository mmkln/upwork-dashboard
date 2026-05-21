import React from "react";
import {
  Button,
  ContentToolbar,
  EmptyState,
  Input,
  PageHeader,
  PageShell,
} from "../shared/ui";
import { JobsSnapshotProgress } from "../features";
import {
  type MarketSignalsFocusMode,
  useMarketSignalsBoard,
} from "../features/marketSignals";
import {
  BoardSettings,
  PatternGroupsPanel,
  SignalFilterBar,
  SignalJobDetailPanel,
  SignalJobsTable,
} from "../features/marketSignals/components";

const getBoardTitle = (board: { marketQuery: string; name: string }) =>
  board.marketQuery.trim() || board.name.trim() || "Untitled research";

const MarketSignalsBoard: React.FC = () => {
  const board = useMarketSignalsBoard();

  return (
    <PageShell>
      {board.activeBoard ? (
        <>
          <PageHeader
            eyebrow="Market Signals"
            title={getBoardTitle(board.activeBoard)}
            actions={
              <Button
                size="sm"
                variant="soft"
                onClick={() => board.setIsSetupOpen(true)}
              >
                Research settings
              </Button>
            }
          />

          <BoardSettings
            open={board.isSetupOpen}
            boards={board.boards}
            activeBoard={board.activeBoard}
            collections={board.collections}
            jobs={board.jobs}
            onOpenChange={board.setIsSetupOpen}
            onSelectBoard={board.handleSelectBoard}
            onCreateBoard={board.handleCreateBoard}
            onChangeBoard={board.handleChangeBoard}
          />

          {board.error ? (
            <EmptyState title="Signals unavailable" description={board.error} />
          ) : null}

          <JobsSnapshotProgress
            loadedCount={board.jobsSnapshot.loadedCount}
            totalCount={board.jobsSnapshot.totalCount}
            isHydrating={board.jobsSnapshot.isHydrating}
            isReady={board.jobsSnapshot.isReady}
            error={board.jobsSnapshot.error}
            label="Loading market signal source jobs"
          />

          <FocusBar
            focusMode={board.focusMode}
            quickSearch={board.quickSearch}
            priorityCount={board.focusCounts.priority}
            reviewCount={board.focusCounts.review}
            correctedCount={board.focusCounts.corrected}
            patternCount={board.focusCounts.patterns}
            totalCount={board.focusCounts.all}
            showAdvancedFilters={board.showAdvancedFilters}
            onFocusModeChange={board.setFocusMode}
            onQuickSearchChange={board.setQuickSearch}
            onToggleAdvancedFilters={() =>
              board.setShowAdvancedFilters((value) => !value)
            }
          />

          {board.showAdvancedFilters ? (
            <SignalFilterBar
              filters={board.filters}
              requestCategories={board.filterOptions.requestCategories}
              clientTypes={board.filterOptions.clientTypes}
              buyerNeeds={board.filterOptions.buyerNeeds}
              skills={board.filterOptions.skills}
              tools={board.filterOptions.tools}
              onChange={board.setFilters}
            />
          ) : null}

          <div
            className={
              board.focusMode === "patterns"
                ? "grid grid-cols-1 gap-component"
                : "grid grid-cols-1 gap-component 2xl:grid-cols-inspector"
            }
          >
            <div className="flex flex-col gap-component">
              {board.focusMode === "patterns" ? (
                <PatternGroupsPanel patterns={board.patternGroups} />
              ) : (
                <SignalJobsTable
                  jobs={board.filteredSignalJobs}
                  selectedJobId={board.selectedJobId}
                  isLoading={board.isLoading}
                  onSelectJob={(job) => board.setSelectedJobId(job.jobId)}
                />
              )}
            </div>
            {board.focusMode !== "patterns" ? (
              <SignalJobDetailPanel
                job={board.selectedJob}
                onSaveOverride={board.handleSaveOverride}
              />
            ) : null}
          </div>
        </>
      ) : (
        <>
          <PageHeader title="Market Signals" />
          <EmptyState
            title="No board configured"
            description="Create a board to start classifying market signals."
          />
        </>
      )}
    </PageShell>
  );
};

type FocusBarProps = {
  focusMode: MarketSignalsFocusMode;
  quickSearch: string;
  priorityCount: number;
  reviewCount: number;
  correctedCount: number;
  patternCount: number;
  totalCount: number;
  showAdvancedFilters: boolean;
  onFocusModeChange: (mode: MarketSignalsFocusMode) => void;
  onQuickSearchChange: (value: string) => void;
  onToggleAdvancedFilters: () => void;
};

const focusOptions: Array<{
  value: MarketSignalsFocusMode;
  label: string;
  getCount: (props: FocusBarProps) => number;
}> = [
  {
    value: "priority",
    label: "Priority",
    getCount: (props) => props.priorityCount,
  },
  {
    value: "review",
    label: "Review",
    getCount: (props) => props.reviewCount,
  },
  {
    value: "patterns",
    label: "Patterns",
    getCount: (props) => props.patternCount,
  },
  {
    value: "corrected",
    label: "Corrected",
    getCount: (props) => props.correctedCount,
  },
  {
    value: "all",
    label: "All",
    getCount: (props) => props.totalCount,
  },
];

const FocusBar: React.FC<FocusBarProps> = (props) => (
  <ContentToolbar>
    <div className="flex flex-col gap-control xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap gap-item">
        {focusOptions.map((option) => (
          <Button
            key={option.value}
            size="xs"
            variant={props.focusMode === option.value ? "primary" : "soft"}
            onClick={() => props.onFocusModeChange(option.value)}
          >
            {option.label} {option.getCount(props)}
          </Button>
        ))}
      </div>
      <div className="flex flex-col gap-item sm:flex-row sm:items-center">
        <Input
          className="min-w-search"
          value={props.quickSearch}
          onChange={(event) => props.onQuickSearchChange(event.target.value)}
          placeholder="Search current focus"
        />
        <Button
          size="sm"
          variant={props.showAdvancedFilters ? "primary" : "soft"}
          onClick={props.onToggleAdvancedFilters}
        >
          {props.showAdvancedFilters ? "Hide filters" : "Show filters"}
        </Button>
      </div>
    </div>
  </ContentToolbar>
);

export default MarketSignalsBoard;
