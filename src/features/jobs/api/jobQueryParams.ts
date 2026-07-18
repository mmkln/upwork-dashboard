import type { JobQueryParams } from "../../../services/apiService";
import type { FilterState } from "../../filters/types";

export const mapFiltersToJobQuery = (
  filters: FilterState,
): Omit<JobQueryParams, "page" | "page_size"> => {
  const params: Omit<JobQueryParams, "page" | "page_size"> = {};

  if (filters.titleFilter.trim()) {
    params.search = filters.titleFilter.trim();
  }

  switch (filters.jobType) {
    case "Fixed Price":
      params.job_type = "fixed";
      if (filters.fixedPriceRange) {
        params.fixed_price_min = filters.fixedPriceRange[0];
        params.fixed_price_max = filters.fixedPriceRange[1];
      }
      break;
    case "Hourly Rate":
      params.job_type = "hourly";
      if (filters.hourlyRateRange) {
        params.hourly_rate_min = filters.hourlyRateRange[0];
        params.hourly_rate_max = filters.hourlyRateRange[1];
      }
      break;
    case "Unspecified":
      params.job_type = "unspecified";
      break;
    default:
      break;
  }

  if (filters.selectedSkills.length) {
    params.skills = filters.selectedSkills.join(",");
  }
  if (filters.selectedInstruments.length) {
    params.instruments = filters.selectedInstruments.join(",");
  }
  if (filters.selectedStatuses.length) {
    params.statuses = filters.selectedStatuses.join(",");
  }
  if (filters.selectedCollectionIds.length) {
    params.collections = filters.selectedCollectionIds.join(",");
  }
  if (filters.selectedExperience.length) {
    params.experience = filters.selectedExperience.join(",");
  }
  if (filters.createdAfter) {
    params.created_after = filters.createdAfter;
  }
  if (filters.createdBefore) {
    params.created_before = filters.createdBefore;
  }
  if (filters.bookmarked) {
    params.bookmarked = true;
  }

  return params;
};
