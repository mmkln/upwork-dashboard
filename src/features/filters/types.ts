import { JobExperience, JobStatus } from "../../models";

export type JobType = "Fixed Price" | "Hourly Rate" | "Unspecified" | "None";

export type FilterState = {
  jobType: JobType;
  fixedPriceRange: [number, number] | null;
  hourlyRateRange: [number, number] | null;
  selectedSkills: string[];
  selectedInstruments: string[];
  selectedStatuses: JobStatus[];
  selectedCollectionIds: number[];
  selectedExperience: JobExperience[];
  titleFilter: string;
  bookmarked: boolean;
};

export const DEFAULT_FILTERS: FilterState = {
  jobType: "None",
  fixedPriceRange: [0, 5000],
  hourlyRateRange: [0, 500],
  selectedSkills: [],
  selectedInstruments: [],
  selectedStatuses: [],
  selectedCollectionIds: [],
  selectedExperience: [],
  titleFilter: "",
  bookmarked: false,
};
