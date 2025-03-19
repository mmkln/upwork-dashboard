import { JobStatus, UpworkJob } from "../../../models";
import { JobType } from "../Filters";
import { toolRegexMap } from "../../../utils";

export const filterJobs = (
  jobs: UpworkJob[],
  jobType: JobType,
  fixedPriceRange: [number, number] | null,
  hourlyRateRange: [number, number] | null,
  selectedSkills: string[],
  selectedInstruments: string[],
  selectedStatuses: JobStatus[],
): UpworkJob[] => {
  return jobs.filter((job) => {
    const fixedPrice = Number(job.fixed_price) || null;

    // Job Type Filter
    let matchesJobType = true;
    if (jobType === "Fixed Price" && fixedPriceRange) {
      matchesJobType =
        fixedPrice !== null &&
        fixedPrice >= fixedPriceRange[0] &&
        fixedPrice <= fixedPriceRange[1];
    } else if (jobType === "Hourly Rate" && hourlyRateRange) {
      matchesJobType =
        job.hourly_rates !== null &&
        job.hourly_rates.some(
          (rate) => rate >= hourlyRateRange[0] && rate <= hourlyRateRange[1],
        );
    } else if (jobType === "Unspecified") {
      matchesJobType = !(job.hourly_rates?.length || fixedPrice);
    } else if (jobType === "None") {
      matchesJobType = true;
    }

    // Skills Filter
    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.some((skill) => job.skills.includes(skill));

    // Instruments Filter
    const matchesInstruments =
      selectedInstruments.length === 0 ||
      selectedInstruments.some((instrument) => {
        const regexes = toolRegexMap[instrument];
        if (!regexes) return false;
        return (
          regexes.some((regex) => regex.test(job.title)) ||
          regexes.some((regex) => regex.test(job.description)) ||
          job.skills.some((skill) => regexes.some((regex) => regex.test(skill)))
        );
      });

    // Statuses Filter
    const matchesStatuses =
      selectedStatuses.length === 0 || selectedStatuses.includes(job.status);

    return (
      matchesJobType && matchesSkills && matchesInstruments && matchesStatuses
    );
  });
};
