import React, { useMemo } from "react";
import { UpworkJob } from "../../models";
import { CategoryValueItem, ValueByCategoryChart } from "../charts";
import { Card } from "../../shared/ui";

interface JobsByIndustryChartProps {
  jobs: UpworkJob[];
  limit?: number;
}

const DEFAULT_LIMIT = 15;
const UNKNOWN_LABEL = "Unknown";

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

const JobsByIndustryChart: React.FC<JobsByIndustryChartProps> = ({
  jobs,
  limit = DEFAULT_LIMIT,
}) => {
  const data = useMemo<CategoryValueItem[]>(() => {
    const counts: Record<string, number> = {};

    jobs.forEach((job) => {
      const key = (job.client_industry || UNKNOWN_LABEL).trim() || UNKNOWN_LABEL;
      counts[key] = (counts[key] || 0) + 1;
    });

    const items = Object.entries(counts).map<CategoryValueItem>(
      ([label, value]) => ({
        label,
        value,
      }),
    );

    return items
      .sort((a, b) => b.value - a.value)
      .slice(0, limit > 0 ? limit : items.length);
  }, [jobs, limit]);

  const maxValue = data.length
    ? roundToSignificant(Math.max(...data.map((item) => item.value)))
    : 10;

  return (
    <Card className="p-card">
        <h2 className="text-heading text-text-primary">Jobs by Client Industry</h2>
        {data.length ? (
          <div className="mt-card h-[21.5rem] overflow-y-auto">
            <ValueByCategoryChart
              data={data}
              maxValue={maxValue}
              minValue={0}
            />
          </div>
        ) : (
          <p className="mt-card text-body text-text-muted">
            No industry data to display.
          </p>
        )}
    </Card>
  );
};

export default JobsByIndustryChart;
