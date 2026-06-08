import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  type MarketResearch,
  useMarketResearchListQuery,
  marketResearchKeys,
} from "../features/marketResearch";
import {
  MarketResearchCreationFlow,
  MarketResearchList,
} from "../features/marketSignals/components";
import { Button, EmptyState, PageShell } from "../shared/ui";

const MarketSignalsBoard = () => {
  const marketResearchQuery = useMarketResearchListQuery();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [draftResearch, setDraftResearch] = useState<MarketResearch | null>(
    null,
  );

  const records = marketResearchQuery.data ?? [];
  const isLoading = marketResearchQuery.isLoading;
  const error = marketResearchQuery.error
    ? (marketResearchQuery.error as Error).message || String(marketResearchQuery.error)
    : "";

  const refresh = () => {
    void marketResearchQuery.refetch();
  };

  const upsertRecord = (record: MarketResearch) => {
    queryClient.setQueryData<MarketResearch[]>(
      marketResearchKeys.list(),
      (oldRecords: MarketResearch[] | undefined = []) => {
        const current = oldRecords ?? [];
        const existingIndex = current.findIndex((r) => r.id === record.id);
        if (existingIndex >= 0) {
          const next = [...current];
          next[existingIndex] = record;
          return next;
        }
        return [record, ...current];
      },
    );
  };

  if (isLoading) {
    return (
      <PageShell>
        <EmptyState title="Loading market research..." />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <EmptyState
          title="Market research unavailable"
          description={error}
          action={
            <Button
              size="sm"
              onClick={refresh}
            >
              Retry
            </Button>
          }
        />
      </PageShell>
    );
  }

  if (records.length > 0 && !isCreating) {
    return (
      <MarketResearchList
        records={records}
        onContinue={(record) => {
          setDraftResearch(record);
          setIsCreating(true);
        }}
        onCreateNew={() => {
          setDraftResearch(null);
          setIsCreating(true);
        }}
      />
    );
  }

  return (
    <MarketResearchCreationFlow
      canCancel={records.length > 0}
      initialResearch={draftResearch}
      onCancel={() => {
        setDraftResearch(null);
        setIsCreating(false);
      }}
      onCompleted={(record) => {
        upsertRecord(record);
        setDraftResearch(null);
        setIsCreating(false);
      }}
      onDraftSaved={(record) => {
        upsertRecord(record);
        setDraftResearch(record);
      }}
    />
  );
};

export default MarketSignalsBoard;
