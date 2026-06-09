import React from "react";
import {
  extractSnapshotSignals,
  getLatestMarketResearchSnapshot,
  type MarketResearch,
  type SnapshotAttributeFacetField,
  type SnapshotAttributeFacetsResponse,
  type SnapshotSignalFacetField,
  type SnapshotSignalFacetItem,
  type SnapshotSignalRow,
  updateMarketSignal,
  useSnapshotAttributeFacetsQuery,
  useSnapshotSignalFacetsQuery,
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

const FACET_SECTIONS: Array<{
  field: SnapshotSignalFacetField;
  label: string;
}> = [
  {
    field: "normalized_request_category",
    label: "Normalized request categories",
  },
  { field: "request_category", label: "Raw request categories" },
  { field: "client_type", label: "Client types" },
  { field: "niche", label: "Niches" },
  { field: "buyer_need", label: "Buyer needs" },
  { field: "extraction_status", label: "Statuses" },
];

const ATTRIBUTE_FACET_SECTIONS: Array<{
  field: SnapshotAttributeFacetField;
  label: string;
}> = [
  { field: "platforms", label: "Platforms" },
  { field: "tools", label: "Tools" },
  { field: "delivery_type", label: "Delivery types" },
  { field: "action_type", label: "Action types" },
  { field: "business_function", label: "Business functions" },
  { field: "object_type", label: "Object types" },
];

const SnapshotSignalsReview: React.FC<SnapshotSignalsReviewProps> = ({
  research,
}) => {
  const latestSnapshot = getLatestMarketResearchSnapshot(research);
  const [status, setStatus] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [normalizedRequestCategory, setNormalizedRequestCategory] =
    React.useState("");
  const [requestCategory, setRequestCategory] = React.useState("");
  const [clientType, setClientType] = React.useState("");
  const [niche, setNiche] = React.useState("");
  const [buyerNeed, setBuyerNeed] = React.useState("");
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
            normalized_request_category: normalizedRequestCategory,
            request_category: requestCategory,
            client_type: clientType,
            niche,
            buyer_need: buyerNeed,
            limit: 50,
            offset: 0,
          }
        : null,
    [
      buyerNeed,
      clientType,
      latestSnapshot,
      niche,
      normalizedRequestCategory,
      requestCategory,
      search,
      status,
    ],
  );
  const snapshotSignalsQuery = useSnapshotSignalsQuery(research.id, query);
  const snapshotFacetsQuery = useSnapshotSignalFacetsQuery(research.id, query);
  const attributeFacetsQuery = useSnapshotAttributeFacetsQuery(
    research.id,
    query,
  );

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
      await Promise.all([
        snapshotSignalsQuery.refetch(),
        snapshotFacetsQuery.refetch(),
        attributeFacetsQuery.refetch(),
      ]);
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
  const facets = snapshotFacetsQuery.data;
  const attributeFacets = attributeFacetsQuery.data;

  const handleFacetClick = (
    field: SnapshotSignalFacetField,
    value: string,
  ) => {
    if (field === "extraction_status") {
      setStatus(value);
      return;
    }
    if (field === "request_category") {
      setRequestCategory(value);
      return;
    }
    if (field === "normalized_request_category") {
      setNormalizedRequestCategory(value);
      return;
    }
    if (field === "client_type") {
      setClientType(value);
      return;
    }
    if (field === "niche") {
      setNiche(value);
      return;
    }
    if (field === "buyer_need") {
      setBuyerNeed(value);
    }
  };

  const clearFilters = () => {
    setStatus("");
    setSearch("");
    setNormalizedRequestCategory("");
    setRequestCategory("");
    setClientType("");
    setNiche("");
    setBuyerNeed("");
  };

  const hasActiveFilters = Boolean(
    status ||
      search ||
      normalizedRequestCategory ||
      requestCategory ||
      clientType ||
      niche ||
      buyerNeed,
  );

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
          {hasActiveFilters ? (
            <Button size="sm" variant="ghost" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null}
        </div>

        <ActiveFilters
          filters={{
            status,
            normalized_request_category: normalizedRequestCategory,
            request_category: requestCategory,
            client_type: clientType,
            niche,
            buyer_need: buyerNeed,
          }}
        />
      </header>

      {facets ? (
        <SnapshotSignalFacetsPanel
          facets={facets.facets}
          totalSignals={facets.total_signals}
          onFacetClick={handleFacetClick}
        />
      ) : null}

      {attributeFacets ? (
        <SnapshotAttributeFacetsPanel data={attributeFacets} />
      ) : null}

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
                    <p className="text-ui text-text-primary">
                      {row.signal.normalized_request_category ||
                        row.signal.request_category ||
                        "Unknown"}
                    </p>
                    {row.signal.normalized_request_category &&
                    row.signal.request_category &&
                    row.signal.normalized_request_category !==
                      row.signal.request_category ? (
                      <p className="mt-micro max-w-title truncate text-label text-text-muted">
                        Raw: {row.signal.request_category}
                      </p>
                    ) : null}
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
            void Promise.all([
              snapshotSignalsQuery.refetch(),
              snapshotFacetsQuery.refetch(),
              attributeFacetsQuery.refetch(),
            ]);
          }}
        />
      ) : null}
    </section>
  );
};

const ActiveFilters: React.FC<{
  filters: {
    status: string;
    normalized_request_category: string;
    request_category: string;
    client_type: string;
    niche: string;
    buyer_need: string;
  };
}> = ({ filters }) => {
  const activeEntries = Object.entries(filters).filter(([, value]) => value);
  if (!activeEntries.length) return null;

  return (
    <div className="flex flex-wrap gap-item text-label text-text-secondary">
      {activeEntries.map(([field, value]) => (
        <span key={field} className="rounded-full bg-surface-muted px-control py-micro">
          {field.replace(/_/g, " ")}: {value}
        </span>
      ))}
    </div>
  );
};

const SnapshotSignalFacetsPanel: React.FC<{
  facets: Record<SnapshotSignalFacetField, SnapshotSignalFacetItem[]>;
  totalSignals: number;
  onFacetClick: (field: SnapshotSignalFacetField, value: string) => void;
}> = ({ facets, totalSignals, onFacetClick }) => (
  <section className="rounded-block border border-border bg-block p-component">
    <div className="flex items-center justify-between gap-item">
      <h3 className="text-ui text-text-primary">Field distribution</h3>
      <span className="text-label text-text-muted">
        {totalSignals.toLocaleString()} signals
      </span>
    </div>
    <div className="mt-component grid gap-component md:grid-cols-2 xl:grid-cols-6">
      {FACET_SECTIONS.map(({ field, label }) => (
        <div key={field} className="min-w-0">
          <p className="mb-control text-label text-text-muted">{label}</p>
          <div className="flex flex-col gap-micro">
            {(facets[field] ?? []).slice(0, 8).map((item) => (
              <button
                key={`${field}-${item.value}`}
                type="button"
                className="flex min-h-control-mini items-center justify-between gap-control rounded-control px-control py-micro text-left text-label text-text-secondary hover:bg-control-hover hover:text-text-primary"
                onClick={() => onFacetClick(field, item.value)}
              >
                <span className="min-w-0 truncate">{item.value}</span>
                <span className="shrink-0 text-text-muted">
                  {item.count.toLocaleString()}
                </span>
              </button>
            ))}
            {facets[field]?.length ? null : (
              <span className="text-label text-text-muted">-</span>
            )}
          </div>
        </div>
      ))}
    </div>
  </section>
);

const SnapshotAttributeFacetsPanel: React.FC<{
  data: SnapshotAttributeFacetsResponse;
}> = ({ data }) => (
  <section className="rounded-block border border-border bg-block p-component">
    <div className="flex items-center justify-between gap-item">
      <div>
        <h3 className="text-ui text-text-primary">Semantic attributes</h3>
        <p className="mt-micro text-label text-text-muted">
          {data.with_attributes.toLocaleString()} with attributes -{" "}
          {data.missing_attributes.toLocaleString()} missing
        </p>
      </div>
      <span className="text-label text-text-muted">
        {data.total_signals.toLocaleString()} signals
      </span>
    </div>
    <div className="mt-component grid gap-component md:grid-cols-2 xl:grid-cols-6">
      {ATTRIBUTE_FACET_SECTIONS.map(({ field, label }) => (
        <div key={field} className="min-w-0">
          <p className="mb-control text-label text-text-muted">{label}</p>
          <div className="flex flex-col gap-micro">
            {(data.facets[field] ?? []).slice(0, 8).map((item) => (
              <div
                key={`${field}-${item.value}`}
                className="flex min-h-control-mini items-center justify-between gap-control rounded-control px-control py-micro text-label text-text-secondary"
              >
                <span className="min-w-0 truncate">{item.value}</span>
                <span className="shrink-0 text-text-muted">
                  {item.count.toLocaleString()}
                </span>
              </div>
            ))}
            {data.facets[field]?.length ? null : (
              <span className="text-label text-text-muted">-</span>
            )}
          </div>
        </div>
      ))}
    </div>
  </section>
);

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
            label="Normalized request category"
            value={formatFieldValue(row.signal.normalized_request_category)}
          />
          <ReadOnlySignalField
            label="Raw request category"
            value={formatFieldValue(row.signal.request_category)}
          />
          <ReadOnlySignalField
            label="Normalization version"
            value={formatFieldValue(
              row.signal.normalized_request_category_version,
            )}
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

        <ReadOnlySignalField
          label="Semantic attributes"
          value={<SemanticAttributesView row={row} />}
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

const SemanticAttributesView: React.FC<{
  row: SnapshotSignalRow;
}> = ({ row }) => {
  const attributes = row.signal.semantic_attributes ?? {};

  return (
    <div className="grid gap-control md:grid-cols-2">
      <AttributeValue label="Platforms" value={attributes.platforms} />
      <AttributeValue label="Tools" value={attributes.tools} />
      <AttributeValue label="Delivery" value={attributes.delivery_type} />
      <AttributeValue label="Action" value={attributes.action_type} />
      <AttributeValue
        label="Business function"
        value={attributes.business_function}
      />
      <AttributeValue label="Object" value={attributes.object_type} />
    </div>
  );
};

const AttributeValue: React.FC<{
  label: string;
  value?: string | string[];
}> = ({ label, value }) => {
  const displayValue = Array.isArray(value)
    ? value.length
      ? value.join(", ")
      : "-"
    : formatFieldValue(value);

  return (
    <div>
      <p className="text-label text-text-muted">{label}</p>
      <p className="mt-micro text-body text-text-secondary">{displayValue}</p>
    </div>
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
