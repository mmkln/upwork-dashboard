import type { CategoryValueItem } from "../../../components/charts";
import type { PreparedUpworkJob } from "../../../models";
import type { FilterState } from "../../filters/types";
import { filterJobsByState } from "./jobFilters";

const MIN_TOOL_OCCURRENCES_PERCENTAGE = 0.02;
const MIN_TOOL_OCCURRENCES_ABSOLUTE = 2;

export type DashboardAnalytics = {
  sourceJobs: PreparedUpworkJob[];
  filteredJobs: PreparedUpworkJob[];
  instrumentAverageRates: CategoryValueItem[];
  averageHourlyRate: number | null;
  bookmarkedCount: number;
  countryCount: number;
};

const getInstrumentAverageRates = (
  jobs: PreparedUpworkJob[],
): CategoryValueItem[] => {
  if (!jobs.length) return [];

  const minOccurrences = Math.max(
    MIN_TOOL_OCCURRENCES_ABSOLUTE,
    Math.floor(jobs.length * MIN_TOOL_OCCURRENCES_PERCENTAGE),
  );

  const accumulator: Record<
    string,
    {
      totalRate: number;
      withRateCount: number;
      totalCount: number;
    }
  > = {};

  jobs.forEach((job) => {
    if (job.matchedInstruments.size === 0) return;

    job.matchedInstruments.forEach((instrument) => {
      if (!accumulator[instrument]) {
        accumulator[instrument] = {
          totalRate: 0,
          withRateCount: 0,
          totalCount: 0,
        };
      }

      const bucket = accumulator[instrument];
      bucket.totalCount += 1;

      if (job.hourlyRateAverage != null) {
        bucket.totalRate += job.hourlyRateAverage;
        bucket.withRateCount += 1;
      }
    });
  });

  return Object.entries(accumulator)
    .filter(
      ([, { totalCount, withRateCount }]) =>
        totalCount >= minOccurrences && withRateCount > 0,
    )
    .map(([label, { totalRate, withRateCount, totalCount }]) => ({
      label,
      value:
        withRateCount > 0 ? Number((totalRate / withRateCount).toFixed(2)) : 0,
      count: totalCount,
    }))
    .sort((left, right) => right.value - left.value);
};

const getAverageHourlyRate = (jobs: PreparedUpworkJob[]) => {
  const jobsWithRates = jobs.filter((job) => job.hourlyRateAverage != null);

  if (!jobsWithRates.length) return null;

  const total = jobsWithRates.reduce(
    (sum, job) => sum + (job.hourlyRateAverage ?? 0),
    0,
  );

  return total / jobsWithRates.length;
};

export const buildDashboardAnalytics = (
  jobs: PreparedUpworkJob[],
  filters: FilterState,
): DashboardAnalytics => {
  const filteredJobs = filterJobsByState(jobs, filters);

  return {
    sourceJobs: jobs,
    filteredJobs,
    instrumentAverageRates: getInstrumentAverageRates(filteredJobs),
    averageHourlyRate: getAverageHourlyRate(filteredJobs),
    bookmarkedCount: filteredJobs.filter((job) => job.is_bookmarked).length,
    countryCount: new Set(filteredJobs.map((job) => job.country).filter(Boolean))
      .size,
  };
};
