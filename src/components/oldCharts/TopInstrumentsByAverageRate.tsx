import React, { useMemo } from "react";
import { CategoryValueItem, ValueByCategoryChart } from "../charts";
import { Card } from "../../shared/ui";

interface TopInstrumentsByAverageRateProps {
  data: CategoryValueItem[];
  limit?: number;
}

const DEFAULT_LIMIT = 15;

const roundToSignificant = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) {
    return 10;
  }
  if (value < 10) {
    return 10;
  }
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  return Math.ceil(value / magnitude) * magnitude;
};

const TopInstrumentsByAverageRate: React.FC<
  TopInstrumentsByAverageRateProps
> = ({ data, limit = DEFAULT_LIMIT }) => {
  const chartData = useMemo(
    () => (limit && limit > 0 ? data.slice(0, limit) : data),
    [data, limit],
  );

  const maxValue = chartData.length
    ? roundToSignificant(
        Math.max(...chartData.map((item) => Number(item.value) || 0)),
      )
    : 10;

  return (
    <Card className="p-card">
      <div className="space-y-item">
        <h2 className="text-heading text-text-primary">
          Top Instruments by Avg Hourly Rate
        </h2>
        <p className="text-body text-text-secondary">
          Average uses jobs with hourly rates; count reflects all matches.
        </p>
      </div>
        {chartData.length ? (
          <div className="mt-card h-[21.5rem] overflow-y-auto">
            <ValueByCategoryChart
              data={chartData}
              maxValue={maxValue}
              minValue={0}
              labelSuffix="$"
            />
          </div>
        ) : (
          <p className="mt-card text-body text-text-muted">
            No instruments found with the specified criteria.
          </p>
        )}
    </Card>
  );
};

export default TopInstrumentsByAverageRate;
