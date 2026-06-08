import React from "react";
import {
  extractSnapshotSignals,
  type ExtractSnapshotSignalsResult,
  getLatestMarketResearchSnapshot,
  getMarketResearchSnapshots,
  getMarketResearchSetupStatus,
  type MarketResearch,
} from "../../marketResearch";
import {
  Badge,
  Button,
  EmptyState,
  PageShell,
} from "../../../shared/ui";

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

const MarketResearchList: React.FC<MarketResearchListProps> = ({
  onContinue,
  records,
  onCreateNew,
}) => {
  const [extractingSnapshotId, setExtractingSnapshotId] = React.useState<
    string | null
  >(null);
  const [extractionResults, setExtractionResults] = React.useState<
    Record<string, ExtractSnapshotSignalsResult>
  >({});
  const [extractionErrors, setExtractionErrors] = React.useState<
    Record<string, string>
  >({});

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

  const handleExtractSignals = async (
    record: MarketResearch,
    snapshotId: string,
  ) => {
    setExtractingSnapshotId(snapshotId);
    setExtractionErrors((current) => {
      const next = { ...current };
      delete next[snapshotId];
      return next;
    });

    try {
      const result = await extractSnapshotSignals(record.id, {
        snapshot_id: snapshotId,
        retry_failed: false,
        limit: 50,
      });
      setExtractionResults((current) => ({
        ...current,
        [snapshotId]: result,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to extract signals.";
      setExtractionErrors((current) => ({
        ...current,
        [snapshotId]: message,
      }));
    } finally {
      setExtractingSnapshotId(null);
    }
  };

  const renderRecord = (record: MarketResearch) => {
    const status = getMarketResearchSetupStatus(record);
    const snapshots = getMarketResearchSnapshots(record);
    const latestSnapshot = getLatestMarketResearchSnapshot(record);
    const latestSnapshotId = latestSnapshot?.id ?? null;
    const isExtracting =
      latestSnapshotId != null && extractingSnapshotId === latestSnapshotId;
    const extractionResult = latestSnapshotId
      ? extractionResults[latestSnapshotId]
      : null;
    const extractionError = latestSnapshotId
      ? extractionErrors[latestSnapshotId]
      : "";

    return (
      <article
        key={record.id}
        className="flex w-full flex-col gap-item rounded-block bg-block p-component"
      >
        <span className="flex flex-col gap-control sm:flex-row sm:items-start sm:justify-between">
          <span className="min-w-0">
            <span className="block truncate text-ui text-text-primary">
              {record.title || "Untitled research"}
            </span>
            {record.description ? (
              <span className="mt-micro block text-body text-text-secondary">
                {record.description}
              </span>
            ) : null}
          </span>
          <span className="flex shrink-0 items-center gap-item">
            <Badge tone={status.isComplete ? "success" : "warning"}>
              {status.label}
            </Badge>
            {!status.isComplete ? (
              <Button
                size="sm"
                variant="soft"
                onClick={() => onContinue(record)}
              >
                Continue setup
              </Button>
            ) : null}
            {status.isComplete && latestSnapshot ? (
              <Button
                size="sm"
                variant="soft"
                disabled={isExtracting}
                onClick={() => {
                  void handleExtractSignals(record, latestSnapshot.id);
                }}
              >
                {isExtracting ? "Extracting..." : "Extract signals"}
              </Button>
            ) : null}
          </span>
        </span>
        <span className="text-label text-text-muted">
          Updated {formatDate(record.updated_at)}
          {snapshots.length
            ? ` - ${snapshots.length.toLocaleString()} snapshot${
                snapshots.length === 1 ? "" : "s"
              }`
            : ""}
          {latestSnapshot
            ? ` - Latest ${latestSnapshot.job_ids.length.toLocaleString()} jobs`
            : ""}
        </span>
        {extractionResult ? (
          <span className="text-label text-text-secondary">
            Processed {extractionResult.processed.toLocaleString()} signals,{" "}
            extracted {extractionResult.extracted.toLocaleString()}, needs
            review {extractionResult.needs_review.toLocaleString()}, failed{" "}
            {extractionResult.failed.toLocaleString()}, remaining{" "}
            {extractionResult.remaining_pending.toLocaleString()}.
          </span>
        ) : null}
        {extractionError ? (
          <span className="text-label text-destructive">
            {extractionError}
          </span>
        ) : null}
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

export default MarketResearchList;
