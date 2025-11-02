import { PreparedUpworkJob, UpworkJob } from "../models";
import { toolRegexMap } from "./instruments.util";
import { createSearchableContent, parseRate } from "./rate.util";

const TOOL_REGEX_ENTRIES = Object.entries(toolRegexMap);

export const prepareJobs = (jobs: UpworkJob[]): PreparedUpworkJob[] => {
  return jobs.map((job) => {
    const hourlyRates = Array.isArray(job.hourly_rates)
      ? job.hourly_rates
          .map((rate) => parseRate(rate))
          .filter(
            (value): value is number =>
              value != null && Number.isFinite(value) && value > 0,
          )
      : [];

    const hourlyRateAverage =
      hourlyRates.length > 0
        ? hourlyRates.reduce((sum, value) => sum + value, 0) /
          hourlyRates.length
        : null;

    const fixedPriceRaw =
      job.fixed_price != null ? Number(job.fixed_price) : null;
    const fixedPriceValue =
      fixedPriceRaw != null && Number.isFinite(fixedPriceRaw)
        ? fixedPriceRaw
        : null;

    const normalizedTitle = (job.title ?? "").toLowerCase();
    const normalizedDescription = (job.description ?? "").toLowerCase();
    const searchableText = createSearchableContent(job);
    const skills = job.skills ?? [];
    const skillsSet = new Set(skills);
    const skillsLowerSet = new Set(
      skills.map((skill) => skill.toLowerCase()),
    );

    const matchedInstruments = new Set<string>();
    if (searchableText) {
      TOOL_REGEX_ENTRIES.forEach(([tool, regexes]) => {
        if (regexes.some((regex) => regex.test(searchableText))) {
          matchedInstruments.add(tool);
        }
      });
    }

    const collectionsSet = new Set(job.collections ?? []);

    return {
      ...job,
      normalizedTitle,
      normalizedDescription,
      searchableText,
      skillsSet,
      skillsLowerSet,
      matchedInstruments,
      hourlyRateValues: hourlyRates,
      hourlyRateAverage,
      hasHourlyRates: hourlyRates.length > 0,
      fixedPriceValue,
      collectionsSet,
    };
  });
};
