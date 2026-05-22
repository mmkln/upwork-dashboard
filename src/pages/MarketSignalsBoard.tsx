import { useState } from "react";
import {
  type MarketResearch,
  useMarketResearchList,
} from "../features/marketResearch";
import {
  MarketResearchCreationFlow,
  MarketResearchList,
} from "../features/marketSignals/components";
import { Button, EmptyState, PageShell } from "../shared/ui";

const MarketSignalsBoard = () => {
  const marketResearch = useMarketResearchList();
  const [isCreating, setIsCreating] = useState(false);
  const [draftResearch, setDraftResearch] = useState<MarketResearch | null>(
    null,
  );

  if (marketResearch.isLoading) {
    return (
      <PageShell>
        <EmptyState title="Loading market research..." />
      </PageShell>
    );
  }

  if (marketResearch.error) {
    return (
      <PageShell>
        <EmptyState
          title="Market research unavailable"
          description={marketResearch.error}
          action={
            <Button
              size="sm"
              onClick={() => {
                void marketResearch.refresh();
              }}
            >
              Retry
            </Button>
          }
        />
      </PageShell>
    );
  }

  if (marketResearch.records.length > 0 && !isCreating) {
    return (
      <MarketResearchList
        records={marketResearch.records}
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
      canCancel={marketResearch.records.length > 0}
      initialResearch={draftResearch}
      onCancel={() => {
        setDraftResearch(null);
        setIsCreating(false);
      }}
      onCompleted={(record) => {
        marketResearch.upsertRecord(record);
        setDraftResearch(null);
        setIsCreating(false);
      }}
      onDraftSaved={(record) => {
        marketResearch.upsertRecord(record);
        setDraftResearch(record);
      }}
    />
  );
};

export default MarketSignalsBoard;
