import { UpworkJob } from "../../../models";
import { JobType } from "../Filters";

export const filterJobs = (
  jobs: UpworkJob[],
  jobType: JobType,
  fixedPriceRange: [number, number] | null,
  hourlyRateRange: [number, number] | null,
  selectedSkills: string[], // Додаємо скіли
): UpworkJob[] => {
  return jobs.filter((job) => {
    const fixedPrice = Number(job.fixed_price) || null;

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

    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.some((skill) => job.skills.includes(skill));

    return matchesJobType && matchesSkills;
  });
};
