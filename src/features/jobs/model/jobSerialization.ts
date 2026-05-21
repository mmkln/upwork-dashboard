import type { PreparedUpworkJob, UpworkJob } from "../../../models";

type ExportableJob = UpworkJob &
  Partial<
    Pick<
      PreparedUpworkJob,
      | "hourlyRateValues"
      | "hourlyRateAverage"
      | "hasHourlyRates"
      | "fixedPriceValue"
    >
  > & {
    matchedInstruments?: string[];
  };

export const serializeJobForExport = (
  job: UpworkJob | PreparedUpworkJob,
): ExportableJob => {
  const rawJob = stripPreparedJobMeta(job);
  const preparedJob = job as Partial<PreparedUpworkJob>;

  return {
    ...rawJob,
    hourlyRateValues: preparedJob.hourlyRateValues,
    hourlyRateAverage: preparedJob.hourlyRateAverage,
    hasHourlyRates: preparedJob.hasHourlyRates,
    fixedPriceValue: preparedJob.fixedPriceValue,
    matchedInstruments:
      preparedJob.matchedInstruments instanceof Set
        ? Array.from(preparedJob.matchedInstruments)
        : undefined,
  };
};

export const stripPreparedJobMeta = (
  job: UpworkJob | PreparedUpworkJob,
): UpworkJob => {
  const preparedJob = job as Partial<PreparedUpworkJob>;
  const {
    normalizedTitle,
    normalizedDescription,
    searchableText,
    skillsSet,
    skillsLowerSet,
    matchedInstruments,
    hourlyRateValues,
    hourlyRateAverage,
    hasHourlyRates,
    fixedPriceValue,
    collectionsSet,
    ...rawJob
  } = preparedJob;

  return rawJob as UpworkJob;
};

export const serializeJobsForExport = (
  jobs: Array<UpworkJob | PreparedUpworkJob>,
) => jobs.map(serializeJobForExport);
