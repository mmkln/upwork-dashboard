import { useState } from "react";
import { useMarketResearchList } from "../features/marketResearch";
import {
  MarketResearchList,
  MarketSignalsEmptyState,
} from "../features/marketSignals/components";
import { Button, EmptyState, PageShell } from "../shared/ui";

const MarketSignalsBoard = () => {
  const marketResearch = useMarketResearchList();
  const [isCreating, setIsCreating] = useState(false);

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
        onCreateNew={() => setIsCreating(true)}
      />
    );
  }

  return (
    <MarketSignalsEmptyState
      onCreated={(record) => {
        marketResearch.addRecord(record);
        setIsCreating(false);
      }}
    />
  );
};

export default MarketSignalsBoard;
