import React from "react";
import { Badge, Card } from "../../../shared/ui";

type SignalSummaryCountersProps = {
  totalJobs: number;
  relevantJobs: number;
  maybeRelevantJobs: number;
  irrelevantJobs: number;
  strongSignals: number;
  patternGroups: number;
  averageMarketSignalScore: number;
  isLoading: boolean;
};

type CounterProps = {
  label: string;
  value: string;
  meta: string;
  tone?: "neutral" | "info" | "success" | "warning";
};

const Counter: React.FC<CounterProps> = ({
  label,
  value,
  meta,
  tone = "neutral",
}) => (
  <Card className="min-h-[118px] p-5">
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-text-muted">{label}</p>
        <Badge tone={tone}>Live</Badge>
      </div>
      <div>
        <p className="truncate text-2xl font-semibold text-text-primary">
          {value}
        </p>
        <p className="mt-2 text-xs text-text-secondary">{meta}</p>
      </div>
    </div>
  </Card>
);

const SignalSummaryCounters: React.FC<SignalSummaryCountersProps> = ({
  totalJobs,
  relevantJobs,
  maybeRelevantJobs,
  irrelevantJobs,
  strongSignals,
  patternGroups,
  averageMarketSignalScore,
  isLoading,
}) => {
  const loadingValue = isLoading ? "..." : undefined;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Counter
        label="Source jobs"
        value={loadingValue ?? totalJobs.toLocaleString()}
        meta="Jobs inside selected source"
        tone="info"
      />
      <Counter
        label="Relevant"
        value={loadingValue ?? relevantJobs.toLocaleString()}
        meta={`${maybeRelevantJobs.toLocaleString()} maybe relevant`}
        tone="success"
      />
      <Counter
        label="Strong signals"
        value={loadingValue ?? strongSignals.toLocaleString()}
        meta={`${irrelevantJobs.toLocaleString()} filtered out`}
        tone="warning"
      />
      <Counter
        label="Pattern groups"
        value={loadingValue ?? patternGroups.toLocaleString()}
        meta={`Avg score ${averageMarketSignalScore.toFixed(1)}`}
        tone="neutral"
      />
    </div>
  );
};

export default SignalSummaryCounters;

