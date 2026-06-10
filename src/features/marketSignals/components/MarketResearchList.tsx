import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  Clock3,
  Files,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  deleteMarketResearch,
  extractSnapshotSignals,
  getLatestMarketResearchSnapshot,
  getMarketResearchSnapshots,
  getMarketResearchSetupStatus,
  marketResearchKeys,
  type JobsSnapshot,
  type MarketResearch,
  type SnapshotSignalsSummary,
  useSnapshotSignalsQuery,
} from "../../marketResearch";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
  IconButton,
  PageShell,
} from "../../../shared/ui";
import SnapshotSignalsReview from "./SnapshotSignalsReview";

type MarketResearchListProps = {
  records: MarketResearch[];
  onContinue: (record: MarketResearch) => void;
  onCreateNew: () => void;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const ResearchMetaItem: React.FC<{
  icon: React.ElementType;
  children: React.ReactNode;
}> = ({ icon: Icon, children }) => (
  <span className="inline-flex min-w-0 items-center gap-micro whitespace-nowrap">
    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    <span className="truncate">{children}</span>
  </span>
);

const ResearchMetaSeparator = () => (
  <span className="h-1 w-1 shrink-0 rounded-full bg-fill-tertiary" aria-hidden="true" />
);

const MarketResearchList: React.FC<MarketResearchListProps> = ({
  onContinue,
  records,
  onCreateNew,
}) => {
  const [reviewResearch, setReviewResearch] =
    React.useState<MarketResearch | null>(null);

  const { completeRecords, unfinishedRecords } = React.useMemo(
    () =>
      records.reduce(
        (groups, record) => {
          const status = getMarketResearchSetupStatus(record);
          if (status.isComplete) {
            groups.completeRecords.push(record);
          } else {
            groups.unfinishedRecords.push(record);
          }
          return groups;
        },
        {
          completeRecords: [] as MarketResearch[],
          unfinishedRecords: [] as MarketResearch[],
        },
      ),
    [records],
  );
  const hasUnfinishedRecords = unfinishedRecords.length > 0;

  if (reviewResearch) {
    return (
      <PageShell>
        <div className="flex justify-start">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setReviewResearch(null)}
          >
            Back
          </Button>
        </div>
        <SnapshotSignalsReview research={reviewResearch} />
      </PageShell>
    );
  }

  const renderRecord = (record: MarketResearch) => {
    const status = getMarketResearchSetupStatus(record);
    const snapshots = getMarketResearchSnapshots(record);
    const latestSnapshot = getLatestMarketResearchSnapshot(record);

    return (
      <article
        key={record.id}
        className="flex w-full flex-col gap-component rounded-block bg-block px-card py-component sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-ui font-semibold text-text-primary">
            {record.title || "Untitled research"}
          </h3>
          {record.description ? (
            <p className="mt-micro truncate text-body text-text-secondary">
              {record.description}
            </p>
          ) : null}
          <div className="mt-control flex flex-wrap items-center gap-x-control gap-y-micro text-label text-text-muted">
            <ResearchMetaItem icon={Clock3}>
              Updated {formatDate(record.updated_at)}
            </ResearchMetaItem>
            {snapshots.length ? (
              <>
                <ResearchMetaSeparator />
                <ResearchMetaItem icon={Files}>
                  {snapshots.length.toLocaleString()} snapshot
                  {snapshots.length === 1 ? "" : "s"}
                </ResearchMetaItem>
              </>
            ) : null}
            {latestSnapshot ? (
              <>
                <ResearchMetaSeparator />
                <ResearchMetaItem icon={BriefcaseBusiness}>
                  Latest {latestSnapshot.job_ids.length.toLocaleString()} jobs
                </ResearchMetaItem>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-item self-start sm:self-auto sm:justify-end">
          <Badge tone={status.isComplete ? "success" : "warning"}>
            {status.label}
          </Badge>
          {!status.isComplete ? (
            <Button
              size="xs"
              variant="soft"
              onClick={() => onContinue(record)}
            >
              Continue setup
            </Button>
          ) : null}
          {status.isComplete && latestSnapshot ? (
            <MarketResearchSignalAction
              record={record}
              snapshot={latestSnapshot}
              onReview={() => setReviewResearch(record)}
            />
          ) : null}
          <MarketResearchActionsMenu record={record} />
        </div>
      </article>
    );
  };

  return (
    <PageShell>
      <div className="flex justify-end">
        <Button
          size="sm"
          variant={hasUnfinishedRecords ? "soft" : "primary"}
          onClick={onCreateNew}
        >
          New research
        </Button>
      </div>

      {records.length ? (
        <div className="flex flex-col gap-card">
          {unfinishedRecords.length ? (
            <section
              aria-label="Continue setup"
              className="flex flex-col gap-item"
            >
              <p className="text-ui text-text-primary">Continue setup</p>
              <div className="flex flex-col gap-item">
                {unfinishedRecords.map(renderRecord)}
              </div>
            </section>
          ) : null}

          {completeRecords.length ? (
            <section aria-label="Research" className="flex flex-col gap-item">
              {hasUnfinishedRecords ? (
                <p className="text-ui text-text-primary">Research</p>
              ) : null}
              <div className="flex flex-col gap-item">
                {completeRecords.map(renderRecord)}
              </div>
            </section>
          ) : null}
        </div>
      ) : (
        <EmptyState
          title="No market research"
          description="Create research from a fresh job snapshot."
          action={
            <Button size="sm" onClick={onCreateNew}>
              New research
            </Button>
          }
        />
      )}
    </PageShell>
  );
};

const MarketResearchActionsMenu: React.FC<{
  record: MarketResearch;
}> = ({ record }) => {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setError("");
    try {
      await deleteMarketResearch(record.id);
      await queryClient.invalidateQueries({
        queryKey: marketResearchKeys.list(),
      });
      setIsConfirmOpen(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to delete research.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton
            size="sm"
            variant="ghost"
            className="shrink-0"
            aria-label="Research actions"
            disabled={isDeleting}
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-popover">
          <DropdownMenuItem
            disabled={isDeleting}
            className="gap-control text-destructive focus:text-destructive"
            onSelect={() => {
              setError("");
              setIsConfirmOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete research
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-modal-sm">
          <DialogTitle>Delete research</DialogTitle>
          <DialogDescription>
            This will delete "{record.title || "Untitled research"}" and its
            linked market research data.
          </DialogDescription>
          {error ? <p className="text-body text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button
              size="sm"
              variant="ghost"
              disabled={isDeleting}
              onClick={() => setIsConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                void handleDelete();
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const hasReviewableSignals = (summary: SnapshotSignalsSummary | undefined) =>
  Boolean(
    summary &&
      summary.extracted +
        summary.needs_review +
        summary.failed +
        summary.manually_edited >
        0,
  );

const MarketResearchSignalAction: React.FC<{
  record: MarketResearch;
  snapshot: JobsSnapshot;
  onReview: () => void;
}> = ({ record, snapshot, onReview }) => {
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [error, setError] = React.useState("");

  const query = React.useMemo(
    () => ({
      snapshot_id: snapshot.id,
      limit: 1,
      offset: 0,
    }),
    [snapshot.id],
  );
  const snapshotSignalsQuery = useSnapshotSignalsQuery(record.id, query);
  const canReview = hasReviewableSignals(snapshotSignalsQuery.data?.summary);

  const handleExtract = async () => {
    setIsExtracting(true);
    setError("");
    try {
      await extractSnapshotSignals(record.id, {
        snapshot_id: snapshot.id,
        retry_failed: false,
        limit: 50,
      });
      await snapshotSignalsQuery.refetch();
    } catch (extractError) {
      setError(
        extractError instanceof Error
          ? extractError.message
          : "Unable to extract signals.",
      );
    } finally {
      setIsExtracting(false);
    }
  };

  if (snapshotSignalsQuery.isLoading && !snapshotSignalsQuery.data) {
    return (
      <Button size="xs" variant="soft" disabled>
        Loading signals
      </Button>
    );
  }

  return (
    <span className="flex items-center gap-item">
      {canReview ? (
        <Button size="xs" variant="soft" onClick={onReview}>
          Review signals
        </Button>
      ) : (
        <Button
          size="xs"
          variant="soft"
          disabled={isExtracting}
          onClick={() => {
            void handleExtract();
          }}
        >
          {isExtracting ? "Extracting..." : "Extract signals"}
        </Button>
      )}
      {error ? (
        <span className="max-w-[220px] truncate text-label text-destructive">
          {error}
        </span>
      ) : null}
    </span>
  );
};

export default MarketResearchList;
