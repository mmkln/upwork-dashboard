import React from "react";
import { Badge, Card, EmptyState } from "../../../shared/ui";
import type { MarketSignalPatternGroup } from "../types";

type PatternGroupsPanelProps = {
  patterns: MarketSignalPatternGroup[];
};

const formatCurrency = (value: number | null) => {
  if (value == null || !Number.isFinite(value)) return "-";
  return `$${Math.round(value).toLocaleString()}`;
};

const getPatternTone = (
  strength: MarketSignalPatternGroup["patternStrength"],
): "success" | "info" | "neutral" => {
  if (strength === "Strong") return "success";
  if (strength === "Medium") return "info";
  return "neutral";
};

const PatternGroupsPanel: React.FC<PatternGroupsPanelProps> = ({
  patterns,
}) => (
  <Card className="p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-text-primary">
          Pattern groups
        </h2>
        <p className="mt-1 text-xs text-text-muted">
          Repeated request, buyer, and need combinations.
        </p>
      </div>
      <Badge tone="info">{patterns.length}</Badge>
    </div>

    {patterns.length ? (
      <div className="mt-5 flex max-h-[700px] flex-col gap-3 overflow-y-auto pr-1">
        {patterns.slice(0, 20).map((pattern) => (
          <div
            key={pattern.patternId}
            className="rounded-[10px] bg-surface-subtle p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-primary">
                  {pattern.requestCategory}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {pattern.clientType} / {pattern.buyerNeed}
                </p>
              </div>
              <Badge tone={getPatternTone(pattern.patternStrength)}>
                {pattern.patternStrength}
              </Badge>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-text-muted">Jobs</p>
                <p className="mt-1 font-semibold text-text-primary">
                  {pattern.jobCount}
                </p>
              </div>
              <div>
                <p className="text-text-muted">Avg score</p>
                <p className="mt-1 font-semibold text-text-primary">
                  {pattern.averageMarketSignalScore.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-text-muted">Avg fixed</p>
                <p className="mt-1 font-semibold text-text-primary">
                  {formatCurrency(pattern.averageBudget)}
                </p>
              </div>
            </div>
            {pattern.commonSkills.length ? (
              <p className="mt-3 text-xs text-text-secondary">
                {pattern.commonSkills.slice(0, 4).join(", ")}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    ) : (
      <div className="mt-5">
        <EmptyState title="No repeated patterns yet" />
      </div>
    )}
  </Card>
);

export default PatternGroupsPanel;

