import React, { useMemo } from "react";
import { CategoryValueItem, ValueByCategoryChart } from "../charts";
import Card from "../ui/Card";

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
    <Card>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-2">
          Top Instruments by Avg Hourly Rate
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Average uses jobs with hourly rates; count reflects all matches.
        </p>
        {chartData.length ? (
          <div className="overflow-y-auto h-[21.5rem]">
            <ValueByCategoryChart
              data={chartData}
              maxValue={maxValue}
              minValue={0}
              labelSuffix="$"
            />
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No instruments found with the specified criteria.
          </p>
        )}
      </div>
    </Card>
  );
};

export default TopInstrumentsByAverageRate;
