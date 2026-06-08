import React from "react";
import {
  extractSnapshotSignals,
  getLatestMarketResearchSnapshot,
  type MarketResearch,
  type SnapshotSignalRow,
  updateMarketSignal,
  useSnapshotSignalsQuery,
} from "../../marketResearch";
import { Badge, Button, EmptyState } from "../../../shared/ui";

type SnapshotSignalsReviewProps = {
  research: MarketResearch;
};

const STATUS_OPTIONS = [
  "",
  "pending",
  "extracted",
  "needs_review",
  "failed",
  "manually_edited",
];

const formatStatus = (value: string) =>
  value ? value.replace(/_/g, " ") : "All statuses";

const formatFieldValue = (value: string | null | undefined) =>
  value && value.trim() ? value : "-";

const SnapshotSignalsReview: React.FC<SnapshotSignalsReviewProps> = ({
  research,
}) => {
  const latestSnapshot = getLatestMarketResearchSnapshot(research);
  const [status, setStatus] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [selectedRow, setSelectedRow] =
    React.useState<SnapshotSignalRow | null>(null);
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [extractError, setExtractError] = React.useState("");

  const query = React.useMemo(
    () =>
      latestSnapshot
        ? {
            snapshot_id: latestSnapshot.id,
            status,
            search,
            limit: 50,
            offset: 0,
          }
        : null,
    [latestSnapshot, search, status],
  );
  const snapshotSignalsQuery = useSnapshotSignalsQuery(research.id, query);

  const handleExtractSignals = async () => {
    if (!latestSnapshot) return;

    setIsExtracting(true);
    setExtractError("");
    try {
      await extractSnapshotSignals(research.id, {
        snapshot_id: latestSnapshot.id,
        retry_failed: false,
        limit: 50,
      });
      await snapshotSignalsQuery.refetch();
    } catch (error) {
      setExtractError(
        error instanceof Error ? error.message : "Unable to extract signals.",
      );
    } finally {
      setIsExtracting(false);
    }
  };

  if (!latestSnapshot) {
    return <EmptyState title="No snapshot yet" />;
  }

  const data = snapshotSignalsQuery.data;

  return (
    <section className="flex flex-col gap-card">
      <header className="flex flex-col gap-item">
        <div className="flex flex-col gap-control sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-heading text-text-primary">
              {research.title || "Untitled research"}
            </h2>
            <p className="text-body text-text-secondary">
              Latest snapshot - {latestSnapshot.job_ids.length.toLocaleString()} jobs
            </p>
          </div>
          <Button
            size="sm"
            variant="soft"
            disabled={isExtracting}
            onClick={() => {
              void handleExtractSignals();
            }}
          >
            {isExtracting ? "Extracting..." : "Extract signals"}
          </Button>
        </div>

        {extractError ? (
          <p className="text-body text-destructive">{extractError}</p>
        ) : null}

        {data ? (
          <div className="flex flex-wrap gap-item text-label text-text-secondary">
            <span>Total {data.summary.total_signals.toLocaleString()}</span>
            <span>Pending {data.summary.pending.toLocaleString()}</span>
            <span>Extracted {data.summary.extracted.toLocaleString()}</span>
            <span>Review {data.summary.needs_review.toLocaleString()}</span>
            <span>Failed {data.summary.failed.toLocaleString()}</span>
            <span>Edited {data.summary.manually_edited.toLocaleString()}</span>
            <span>Missing {data.summary.missing_signals.toLocaleString()}</span>
          </div>
        ) : null}

        <div className="flex flex-col gap-item sm:flex-row">
          <input
            className="h-target rounded-control border border-border bg-surface px-component text-body text-text-primary"
            placeholder="Search signals..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="h-target rounded-control border border-border bg-surface px-component text-body text-text-primary"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option || "all"} value={option}>
                {formatStatus(option)}
              </option>
            ))}
          </select>
        </div>
      </header>

      {snapshotSignalsQuery.isLoading ? (
        <EmptyState title="Loading signals..." />
      ) : data?.results.length ? (
        <div className="overflow-x-auto rounded-block border border-border">
          <table className="w-full min-w-table-lg text-left text-body">
            <thead className="bg-surface-muted text-label text-text-secondary">
              <tr>
                <th className="px-component py-control">Job</th>
                <th className="px-component py-control">Category</th>
                <th className="px-component py-control">Buyer Need</th>
                <th className="px-component py-control">Problem</th>
                <th className="px-component py-control">Budget</th>
                <th className="px-component py-control">Urgency</th>
                <th className="px-component py-control">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((row: SnapshotSignalRow) => (
                <tr
                  key={row.signal_id}
                  className="cursor-pointer border-t border-border hover:bg-control-hover"
                  onClick={() => setSelectedRow(row)}
                >
                  <td className="px-component py-control">
                    <p className="line-clamp-2 max-w-title text-ui text-text-primary">
                      {row.job.title}
                    </p>
                    <p className="text-label text-text-muted">
                      {row.job.country || "Unknown country"}
                    </p>
                  </td>
                  <td className="px-component py-control text-text-secondary">
                    {row.signal.request_category || "Unknown"}
                  </td>
                  <td className="px-component py-control text-text-secondary">
                    {row.signal.buyer_need || "Unknown"}
                  </td>
                  <td className="px-component py-control text-text-secondary">
                    <span className="line-clamp-2">
                      {row.signal.problem || "-"}
                    </span>
                  </td>
                  <td className="px-component py-control text-text-secondary">
                    {row.signal.budget_signal || "-"}
                  </td>
                  <td className="px-component py-control text-text-secondary">
                    {row.signal.urgency_signal || "-"}
                  </td>
                  <td className="px-component py-control">
                    <Badge
                      tone={
                        row.signal.extraction_status === "failed"
                          ? "warning"
                          : row.signal.extraction_status === "extracted"
                            ? "success"
                            : "neutral"
                      }
                    >
                      {formatStatus(row.signal.extraction_status)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No signals match these filters"
          description="Adjust the status or search query."
        />
      )}

      {selectedRow ? (
        <SignalDetailEditor
          row={selectedRow}
          onClose={() => setSelectedRow(null)}
          onSaved={() => {
            setSelectedRow(null);
            void snapshotSignalsQuery.refetch();
          }}
        />
      ) : null}
    </section>
  );
};

const SignalDetailEditor: React.FC<{
  row: SnapshotSignalRow;
  onClose: () => void;
  onSaved: () => void;
}> = ({ row, onClose, onSaved }) => {
  const [problem, setProblem] = React.useState(row.signal.problem);
  const [buyerNeed, setBuyerNeed] = React.useState(row.signal.buyer_need);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  const save = async () => {
    setIsSaving(true);
    setError("");
    try {
      await updateMarketSignal(row.signal_id, {
        problem,
        buyer_need: buyerNeed,
      });
      onSaved();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save signal.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <aside className="rounded-block border border-border bg-block p-component">
      <div className="flex items-start justify-between gap-item">
        <div>
          <h3 className="text-ui text-text-primary">{row.job.title}</h3>
          <p className="mt-micro text-label text-text-muted">
            {formatStatus(row.signal.extraction_status)}
          </p>
        </div>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="mt-component flex flex-col gap-item">
        <div className="grid gap-item md:grid-cols-2">
          <ReadOnlySignalField
            label="Request category"
            value={formatFieldValue(row.signal.request_category)}
          />
          <ReadOnlySignalField
            label="Client type"
            value={formatFieldValue(row.signal.client_type)}
          />
          <ReadOnlySignalField
            label="Niche"
            value={formatFieldValue(row.signal.niche)}
          />
          <ReadOnlySignalField
            label="Buyer need"
            value={formatFieldValue(row.signal.buyer_need)}
          />
          <ReadOnlySignalField
            label="Budget signal"
            value={formatFieldValue(row.signal.budget_signal)}
          />
          <ReadOnlySignalField
            label="Urgency signal"
            value={formatFieldValue(row.signal.urgency_signal)}
          />
          <ReadOnlySignalField
            label="Status"
            value={formatStatus(row.signal.extraction_status)}
          />
        </div>

        <ReadOnlySignalField
          label="Exact client language"
          value={
            row.signal.exact_client_language.length ? (
              <ul className="space-y-micro">
                {row.signal.exact_client_language.map((language, index) => (
                  <li key={`${language}-${index}`}>{language}</li>
                ))}
              </ul>
            ) : (
              "-"
            )
          }
        />

        <ReadOnlySignalField
          label="Value connection"
          value={formatFieldValue(row.signal.value_connection)}
        />

        {row.signal.error ? (
          <ReadOnlySignalField label="Error" value={row.signal.error} />
        ) : null}

        <label className="flex flex-col gap-micro text-label text-text-secondary">
          Problem
          <textarea
            className="min-h-[96px] rounded-control border border-border bg-surface p-control text-body text-text-primary"
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
          />
        </label>

        <label className="flex flex-col gap-micro text-label text-text-secondary">
          Buyer need
          <input
            className="h-target rounded-control border border-border bg-surface px-control text-body text-text-primary"
            value={buyerNeed}
            onChange={(event) => setBuyerNeed(event.target.value)}
          />
        </label>

        {error ? <p className="text-body text-destructive">{error}</p> : null}

        <div className="flex justify-end gap-item">
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={save} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </aside>
  );
};

const ReadOnlySignalField: React.FC<{
  label: string;
  value: React.ReactNode;
}> = ({ label, value }) => (
  <div className="rounded-control bg-surface-muted p-control">
    <p className="text-label text-text-muted">{label}</p>
    <div className="mt-micro text-body text-text-secondary">{value}</div>
  </div>
);

export default SnapshotSignalsReview;
