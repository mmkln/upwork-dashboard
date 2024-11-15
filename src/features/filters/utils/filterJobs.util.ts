import { UpworkJob } from "../../../models";
import { JobType } from "../Filters";

export const filterJobs = (
  jobs: UpworkJob[],
  jobType: JobType,
  fixedPriceRange: [number, number] | null,
  hourlyRateRange: [number, number] | null,
): UpworkJob[] => {
  return jobs.filter((job) => {
    if (jobType === "Fixed Price" && fixedPriceRange) {
      return (
        job.fixed_price !== null &&
        job.fixed_price >= fixedPriceRange[0] &&
        job.fixed_price <= fixedPriceRange[1]
      );
    }
    if (jobType === "Hourly Rate" && hourlyRateRange) {
      return (
        job.hourly_rates !== null &&
        job.hourly_rates.some(
          (rate) => rate >= hourlyRateRange[0] && rate <= hourlyRateRange[1],
        )
      );
    }
    if (jobType === "Unspecified") {
      return !(job.hourly_rates || job.fixed_price);
    }
    return jobType === "None";
  });
};
