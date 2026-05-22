import React from "react";
import type { MarketResearch } from "../../marketResearch";
import {
  Badge,
  Button,
  EmptyState,
  PageShell,
} from "../../../shared/ui";

type MarketResearchListProps = {
  records: MarketResearch[];
  onCreateNew: () => void;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const MarketResearchList: React.FC<MarketResearchListProps> = ({
  records,
  onCreateNew,
}) => (
  <PageShell>
    <div className="flex justify-end">
      <Button size="sm" onClick={onCreateNew}>
        New research
      </Button>
    </div>

    {records.length ? (
      <div className="flex flex-col gap-item">
        {records.map((record) => (
          <article
            key={record.id}
            className="flex w-full flex-col gap-item rounded-block bg-block p-component"
          >
            <span className="flex flex-col gap-item sm:flex-row sm:items-start sm:justify-between">
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
              <Badge tone="info">Research</Badge>
            </span>
            <span className="text-label text-text-muted">
              Updated {formatDate(record.updated_at)}
            </span>
          </article>
        ))}
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

export default MarketResearchList;
