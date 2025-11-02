import React, { useMemo } from "react";
import { UpworkJob } from "../../models";
import { toolRegexMap } from "../../utils";
import { CategoryValueItem, ValueByCategoryChart } from "../charts";
import Card from "../ui/Card";

interface TopInstrumentsByAverageRateProps {
  jobs: UpworkJob[];
  limit?: number;
  minOccurrences?: number;
}

const DEFAULT_LIMIT = 15;
const DEFAULT_MIN_OCCURRENCES = 2;

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

const TOOL_ENTRIES = Object.entries(toolRegexMap);

const parseRate = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const sanitized = value.replace(/[^0-9.,-]+/g, "");
    if (!sanitized) {
      return null;
    }

    const normalized =
      sanitized.includes(",") && !sanitized.includes(".")
        ? sanitized.replace(",", ".")
        : sanitized.replace(/,/g, "");

    const numeric = Number.parseFloat(normalized);
    return Number.isFinite(numeric) ? numeric : null;
  }

  return null;
};

const computeJobRate = (job: UpworkJob): number | null => {
  const directRate = parseRate(job.average_rate);
  if (directRate != null && directRate > 0) {
    return directRate;
  }

  const hourlyRates = Array.isArray(job.hourly_rates)
    ? job.hourly_rates
        .map((rate) => parseRate(rate))
        .filter((rate): rate is number => rate != null)
    : [];

  if (hourlyRates.length) {
    const total = hourlyRates.reduce((sum, current) => sum + current, 0);
    const average = total / hourlyRates.length;
    return Number.isFinite(average) && average > 0 ? average : null;
  }

  return null;
};

const TopInstrumentsByAverageRate: React.FC<
  TopInstrumentsByAverageRateProps
> = ({ jobs, limit = DEFAULT_LIMIT, minOccurrences = DEFAULT_MIN_OCCURRENCES }) => {
  const aggregatedData = useMemo(() => {
    const accumulator: Record<
      string,
      {
        totalRate: number;
        count: number;
      }
    > = {};

    jobs.forEach((job) => {
      const rate = computeJobRate(job);

      if (rate == null) {
        return;
      }

      const searchableContent = [
        job.title ?? "",
        job.description ?? "",
        ...(job.skills ?? []),
      ]
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (!searchableContent) {
        return;
      }

      TOOL_ENTRIES.forEach(([tool, regexes]) => {
        const matches = regexes.some((regex) => regex.test(searchableContent));

        if (!matches) {
          return;
        }

        if (!accumulator[tool]) {
          accumulator[tool] = { totalRate: rate, count: 1 };
        } else {
          accumulator[tool].totalRate += rate;
          accumulator[tool].count += 1;
        }
      });
    });

    return Object.entries(accumulator)
      .map<CategoryValueItem>(([tool, { totalRate, count }]) => ({
        label: tool,
        value: Number((totalRate / count).toFixed(2)),
        count,
      }))
      .filter(
        (item) =>
          item.count != null &&
          item.count >= minOccurrences &&
          Number.isFinite(item.value),
      )
      .sort((a, b) => b.value - a.value);
  }, [jobs, minOccurrences]);

  const chartData =
    limit && limit > 0 ? aggregatedData.slice(0, limit) : aggregatedData;

  const maxValue = chartData.length
    ? roundToSignificant(
        Math.max(...chartData.map((item) => Number(item.value) || 0)),
      )
    : 10;

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-6">
          Top Instruments by Avg Hourly Rate
        </h2>
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
