import {
  JobExperience,
  JobStatus,
  PreparedUpworkJob,
} from "../../../models";
import { matchesBooleanSearch } from "../../../utils";
import type { FilterState, JobType } from "../../filters/types";

export const filterJobsByState = (
  jobs: PreparedUpworkJob[],
  filters: FilterState,
) =>
  filterJobs(
    jobs,
    filters.jobType,
    filters.fixedPriceRange,
    filters.hourlyRateRange,
    filters.selectedSkills,
    filters.selectedInstruments,
    filters.selectedStatuses,
    filters.selectedCollectionIds,
    filters.selectedExperience,
    filters.titleFilter,
    filters.bookmarked,
  );

export const filterJobs = (
  jobs: PreparedUpworkJob[],
  jobType: JobType,
  fixedPriceRange: [number, number] | null,
  hourlyRateRange: [number, number] | null,
  selectedSkills: string[],
  selectedInstruments: string[],
  selectedStatuses: JobStatus[],
  selectedCollectionIds: number[],
  selectedExperience: JobExperience[],
  titleFilter: string = "",
  bookmarked: boolean,
): PreparedUpworkJob[] => {
  const titleQuery = titleFilter.trim();
  const selectedSkillsSet =
    selectedSkills.length > 0 ? new Set(selectedSkills) : null;
  const selectedInstrumentsSet =
    selectedInstruments.length > 0 ? new Set(selectedInstruments) : null;
  const selectedStatusesSet =
    selectedStatuses.length > 0 ? new Set(selectedStatuses) : null;
  const selectedExperienceSet =
    selectedExperience.length > 0 ? new Set(selectedExperience) : null;
  const selectedCollectionsSet =
    selectedCollectionIds.length > 0 ? new Set(selectedCollectionIds) : null;

  return jobs.filter((job) => {
    if (titleQuery && !matchesBooleanSearch(job.searchableText, titleQuery)) {
      return false;
    }

    let matchesJobType = true;
    if (jobType === "Fixed Price" && fixedPriceRange) {
      matchesJobType =
        job.fixedPriceValue !== null &&
        job.fixedPriceValue >= fixedPriceRange[0] &&
        job.fixedPriceValue <= fixedPriceRange[1];
    } else if (jobType === "Hourly Rate" && hourlyRateRange) {
      matchesJobType =
        job.hourlyRateValues.length > 0 &&
        job.hourlyRateValues.some(
          (rate) => rate >= hourlyRateRange[0] && rate <= hourlyRateRange[1],
        );
    } else if (jobType === "Unspecified") {
      matchesJobType = !(job.hasHourlyRates || job.fixedPriceValue);
    } else if (jobType === "None") {
      matchesJobType = true;
    }

    const matchesSkills =
      !selectedSkillsSet ||
      selectedSkills.some((skill) => job.skillsSet.has(skill));

    const matchesInstruments =
      !selectedInstrumentsSet ||
      selectedInstruments.some((instrument) =>
        job.matchedInstruments.has(instrument),
      );

    const matchesStatuses =
      !selectedStatusesSet || selectedStatusesSet.has(job.status);

    const matchesExperience =
      !selectedExperienceSet ||
      selectedExperienceSet.has(job.experience as JobExperience);

    const matchesBookmarked =
      !bookmarked || job.is_bookmarked === bookmarked;

    let matchesCollections = true;
    if (selectedCollectionsSet) {
      const jobCollections = job.collections ?? [];
      matchesCollections = jobCollections.some((collectionId) =>
        selectedCollectionsSet.has(collectionId),
      );
    }

    return (
      matchesJobType &&
      matchesSkills &&
      matchesInstruments &&
      matchesStatuses &&
      matchesCollections &&
      matchesExperience &&
      matchesBookmarked
    );
  });
};
