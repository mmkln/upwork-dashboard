// src/feature/filters/utils/filterJobs.util.ts
import {
  JobStatus,
  JobExperience,
  PreparedUpworkJob,
} from "../../../models";
import { JobType } from "../Filters";
import { matchesBooleanSearch } from "../../../utils";

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
    // Skip filtering if no title filter is provided or use boolean search
    if (titleQuery && !matchesBooleanSearch(job.searchableText, titleQuery)) {
      return false;
    }

    // Job Type Filter
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

    // Skills Filter
    const matchesSkills =
      !selectedSkillsSet ||
      selectedSkills.some((skill) => job.skillsSet.has(skill));

    // Instruments Filter
    const matchesInstruments =
      !selectedInstrumentsSet ||
      selectedInstruments.some((instrument) =>
        job.matchedInstruments.has(instrument),
      );

    // Statuses Filter
    const matchesStatuses =
      !selectedStatusesSet || selectedStatusesSet.has(job.status);

    // Experience Filter
    const matchesExperience =
      !selectedExperienceSet ||
      selectedExperienceSet.has(job.experience as JobExperience);

    // Bookmarked Filter
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
