import React, { useState, useCallback, useEffect } from "react";
import { JobStatus, JobExperience } from "../../models";
import {
  Checkbox,
  Input,
  MultiSelect,
  RangeInput,
  Select as UiSelect,
} from "../../shared/ui";
import { camelToCapitalizedWords, debounce } from "../../utils";
import { FilterState } from "./types";

export type JobType = "Fixed Price" | "Hourly Rate" | "Unspecified" | "None";

interface FilterComponentProps {
  onFilterChange: (
    jobType: JobType,
    fixedPriceRange: [number, number] | null,
    hourlyRateRange: [number, number] | null,
    selectedSkills: string[],
    selectedInstruments: string[],
    selectedStatuses: JobStatus[],
    selectedCollectionIds: number[],
    selectedExperience: JobExperience[],
    titleFilter: string,
    bookmarked: boolean,
  ) => void;
  availableSkills: string[];
  availableInstruments: string[];
  availableStatuses: JobStatus[];
  availableCollections: { id: number; name: string }[];
  initialFilters?: FilterState;
}

const INITIAL_HOURLY_RATE_MAX = 500;
const INITIAL_FIXED_PRICE_MAX = 5000;

export const FilterComponent: React.FC<FilterComponentProps> = ({
  onFilterChange,
  availableSkills,
  availableInstruments,
  availableStatuses,
  availableCollections,
  initialFilters,
}) => {
  const [jobType, setJobType] = useState<JobType>(initialFilters?.jobType ?? "None");
  const [fixedPriceRange, setFixedPriceRange] = useState<
    [number, number] | null
  >(initialFilters?.fixedPriceRange ?? [0, INITIAL_FIXED_PRICE_MAX]);
  const [hourlyRateRange, setHourlyRateRange] = useState<
    [number, number] | null
  >(initialFilters?.hourlyRateRange ?? [0, INITIAL_HOURLY_RATE_MAX]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialFilters?.selectedSkills ?? []);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(initialFilters?.selectedInstruments ?? []);
  const [selectedStatuses, setSelectedStatuses] = useState<JobStatus[]>(initialFilters?.selectedStatuses ?? []);
  const [selectedCollections, setSelectedCollections] = useState<number[]>(initialFilters?.selectedCollectionIds ?? []);
  const [selectedJobExperience, setSelectedJobExperience] = useState<
    JobExperience[]
  >(initialFilters?.selectedExperience ?? []);
  const [titleFilter, setTitleFilter] = useState<string>(initialFilters?.titleFilter ?? "");
  const [bookmarked, setBookmarked] = useState<boolean>(initialFilters?.bookmarked ?? false);

  useEffect(() => {
    if (!initialFilters) return;
    setJobType(initialFilters.jobType);
    setFixedPriceRange(initialFilters.fixedPriceRange ?? [0, INITIAL_FIXED_PRICE_MAX]);
    setHourlyRateRange(initialFilters.hourlyRateRange ?? [0, INITIAL_HOURLY_RATE_MAX]);
    setSelectedSkills(initialFilters.selectedSkills ?? []);
    setSelectedInstruments(initialFilters.selectedInstruments ?? []);
    setSelectedStatuses(initialFilters.selectedStatuses ?? []);
    setSelectedCollections(initialFilters.selectedCollectionIds ?? []);
    setSelectedJobExperience(initialFilters.selectedExperience ?? []);
    setTitleFilter(initialFilters.titleFilter ?? "");
    setBookmarked(initialFilters.bookmarked ?? false);
  }, [initialFilters]);

  const skillOptions = availableSkills.map((skill) => ({
    value: skill,
    label: skill,
  }));

  const instrumentOptions = availableInstruments.map((instrument) => ({
    value: instrument,
    label: instrument,
  }));

  const statusOptions = availableStatuses.map((status) => ({
    value: status,
    label: camelToCapitalizedWords(status),
  }));

  const collectionOptions = availableCollections.map((collection) => ({
    value: collection.id,
    label: collection.name,
  }));

  const experienceOptions = Object.values(JobExperience).map((exp) => ({
    value: exp,
    label: exp,
  }));

  useEffect(() => {
    setSelectedCollections((prev) => {
      const validIds = prev.filter((id) =>
        availableCollections.some((collection) => collection.id === id),
      );
      if (validIds.length !== prev.length) {
        onFilterChange(
          jobType,
          fixedPriceRange,
          hourlyRateRange,
          selectedSkills,
          selectedInstruments,
          selectedStatuses,
          validIds,
          selectedJobExperience,
          titleFilter,
          bookmarked,
        );
      }
      return validIds;
    });
  }, [availableCollections, bookmarked, fixedPriceRange, hourlyRateRange, jobType, onFilterChange, selectedInstruments, selectedJobExperience, selectedSkills, selectedStatuses, titleFilter]);

  // Debounced filter change handler
  const debouncedFilterChange = useCallback(
    debounce((value: string) => {
      onFilterChange(
        jobType,
        fixedPriceRange,
        hourlyRateRange,
        selectedSkills,
        selectedInstruments,
        selectedStatuses,
        selectedCollections,
        selectedJobExperience,
        value,
        bookmarked,
      );
    }, 300),
    [
      jobType,
      fixedPriceRange,
      hourlyRateRange,
      selectedSkills,
      selectedInstruments,
      selectedStatuses,
      selectedCollections,
      selectedJobExperience,
      bookmarked,
    ],
  );

  const handleTitleFilterChange = (value: string) => {
    setTitleFilter(value);
    debouncedFilterChange(value);
  };

  const handleJobTypeChange = (value: JobType) => {
    setJobType(value);
    onFilterChange(
      value,
      fixedPriceRange,
      hourlyRateRange,
      selectedSkills,
      selectedInstruments,
      selectedStatuses,
      selectedCollections,
      selectedJobExperience,
      titleFilter,
      bookmarked,
    );
  };

  const handleFixedPriceChange = (min: number, max: number) => {
    // Validate inputs: ensure non-negative and min <= max
    const validatedMin = Math.max(0, min);
    const validatedMax = Math.max(validatedMin, max);
    const range: [number, number] = [validatedMin, validatedMax];
    setFixedPriceRange(range);
    onFilterChange(
      jobType,
      range,
      hourlyRateRange,
      selectedSkills,
      selectedInstruments,
      selectedStatuses,
      selectedCollections,
      selectedJobExperience,
      titleFilter,
      bookmarked,
    );
  };

  const handleHourlyRateChange = (min: number, max: number) => {
    // Add validation similar to fixed price
    const validatedMin = Math.max(0, min);
    const validatedMax = Math.max(validatedMin, max);
    const range: [number, number] = [validatedMin, validatedMax];
    setHourlyRateRange(range);
    onFilterChange(
      jobType,
      fixedPriceRange,
      range,
      selectedSkills,
      selectedInstruments,
      selectedStatuses,
      selectedCollections,
      selectedJobExperience,
      titleFilter,
      bookmarked,
    );
  };

  const handleSkillsChange = (skills: string[]) => {
    setSelectedSkills(skills);
    onFilterChange(
      jobType,
      fixedPriceRange,
      hourlyRateRange,
      skills,
      selectedInstruments,
      selectedStatuses,
      selectedCollections,
      selectedJobExperience,
      titleFilter,
      bookmarked,
    );
  };

  const handleInstrumentsChange = (instruments: string[]) => {
    setSelectedInstruments(instruments);
    onFilterChange(
      jobType,
      fixedPriceRange,
      hourlyRateRange,
      selectedSkills,
      instruments,
      selectedStatuses,
      selectedCollections,
      selectedJobExperience,
      titleFilter,
      bookmarked,
    );
  };

  const handleStatusesChange = (statuses: JobStatus[]) => {
    setSelectedStatuses(statuses);
    onFilterChange(
      jobType,
      fixedPriceRange,
      hourlyRateRange,
      selectedSkills,
      selectedInstruments,
      statuses,
      selectedCollections,
      selectedJobExperience,
      titleFilter,
      bookmarked,
    );
  };

  const handleCollectionsChange = (collections: number[]) => {
    setSelectedCollections(collections);
    onFilterChange(
      jobType,
      fixedPriceRange,
      hourlyRateRange,
      selectedSkills,
      selectedInstruments,
      selectedStatuses,
      collections,
      selectedJobExperience,
      titleFilter,
      bookmarked,
    );
  };

  const handleExperienceChange = (experiences: JobExperience[]) => {
    setSelectedJobExperience(experiences);
    onFilterChange(
      jobType,
      fixedPriceRange,
      hourlyRateRange,
      selectedSkills,
      selectedInstruments,
      selectedStatuses,
      selectedCollections,
      experiences,
      titleFilter,
      bookmarked,
    );
  };

  const handleBookmarkedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const bookmarked = e.target.checked;
    setBookmarked(bookmarked);
    onFilterChange(
      jobType,
      fixedPriceRange,
      hourlyRateRange,
      selectedSkills,
      selectedInstruments,
      selectedStatuses,
      selectedCollections,
      selectedJobExperience,
      titleFilter,
      bookmarked,
    );
  };

  return (
    <div className="rounded-md">
      <div className="flex flex-wrap gap-6">
        {/* Title Filter */}
        <div className="flex flex-col w-full md:w-1/4">
          <label className="mb-1 text-sm font-semibold text-gray-700">
            Search in Title
          </label>
          <Input
            type="text"
            placeholder="Filter by job title..."
            value={titleFilter}
            onChange={(e) => handleTitleFilterChange(e.target.value)}
          />
        </div>
        {/* Job Type */}
        <div className="flex flex-col w-full md:w-1/4">
          <label className="mb-1 text-sm font-semibold text-gray-700">
            Job Type
          </label>
          <UiSelect
            value={jobType}
            onChange={(e) => handleJobTypeChange(e.target.value as JobType)}
          >
            <option value="Fixed Price">Fixed Price</option>
            <option value="Hourly Rate">Hourly Rate</option>
            <option value="Unspecified">Unspecified</option>
            <option value="None">None</option>
          </UiSelect>
        </div>

        {/* Fixed Price Range */}
        {jobType === "Fixed Price" && (
          <div className="flex flex-col w-full md:w-1/2">
            <label className="mb-1 text-sm font-semibold text-gray-700">
              Fixed Price Range
            </label>
            <div className="flex items-center space-x-3">
              <Input
                type="number"
                min="0"
                max="5000"
                value={fixedPriceRange ? fixedPriceRange[0] : 0}
                onChange={(e) =>
                  handleFixedPriceChange(
                    Number(e.target.value),
                    fixedPriceRange
                      ? fixedPriceRange[1]
                      : INITIAL_FIXED_PRICE_MAX,
                  )
                }
                className="w-1/2"
                placeholder="Min Price"
              />
              <span className="text-sm text-gray-700">to</span>
              <Input
                type="number"
                min="0"
                max="5000"
                value={
                  fixedPriceRange ? fixedPriceRange[1] : INITIAL_FIXED_PRICE_MAX
                }
                onChange={(e) =>
                  handleFixedPriceChange(
                    fixedPriceRange ? fixedPriceRange[0] : 0,
                    Number(e.target.value),
                  )
                }
                className="w-1/2"
                placeholder="Max Price"
              />
            </div>
          </div>
        )}

        {/* Hourly Rate Range */}
        {jobType === "Hourly Rate" && (
          <div className="flex flex-col w-full md:w-1/2">
            <label className="mb-1 text-sm font-semibold text-gray-700">
              Hourly Rate Range
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <RangeInput
                  min="0"
                  max="500"
                  value={hourlyRateRange ? hourlyRateRange[0] : 0}
                  onChange={(e) =>
                    handleHourlyRateChange(
                      Number(e.target.value),
                      hourlyRateRange
                        ? hourlyRateRange[1]
                        : INITIAL_HOURLY_RATE_MAX,
                    )
                  }
                />
                <span className="w-16 text-sm text-gray-700">
                  ${hourlyRateRange ? hourlyRateRange[0] : 0}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <RangeInput
                  min="0"
                  max="500"
                  value={
                    hourlyRateRange
                      ? hourlyRateRange[1]
                      : INITIAL_HOURLY_RATE_MAX
                  }
                  onChange={(e) =>
                    handleHourlyRateChange(
                      hourlyRateRange ? hourlyRateRange[0] : 0,
                      Number(e.target.value),
                    )
                  }
                />
                <span className="w-16 text-sm text-gray-700">
                  $
                  {hourlyRateRange
                    ? hourlyRateRange[1]
                    : INITIAL_HOURLY_RATE_MAX}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Skills */}
        <div className="flex flex-col w-full md:w-1/4">
          <label className="mb-1 text-sm font-semibold text-gray-700">
            Skills
          </label>
          <MultiSelect
            options={skillOptions}
            value={selectedSkills}
            onChange={handleSkillsChange}
            placeholder="Select skills..."
            searchPlaceholder="Search skills..."
          />
        </div>

        {/* Instruments */}
        <div className="flex flex-col w-full md:w-1/4">
          <label className="mb-1 text-sm font-semibold text-gray-700">
            Instruments
          </label>
          <MultiSelect
            options={instrumentOptions}
            value={selectedInstruments}
            onChange={handleInstrumentsChange}
            placeholder="Select instruments..."
            searchPlaceholder="Search instruments..."
          />
        </div>

        {/* Job Statuses */}
        <div className="flex flex-col w-full md:w-1/4">
          <label className="mb-1 text-sm font-semibold text-gray-700">
            Job Statuses
          </label>
          <MultiSelect
            options={statusOptions}
            value={selectedStatuses}
            onChange={handleStatusesChange}
            placeholder="Select statuses..."
            searchPlaceholder="Search statuses..."
          />
        </div>

        {/* Collections */}
        <div className="flex flex-col w-full md:w-1/4">
          <label className="mb-1 text-sm font-semibold text-gray-700">
            Collections
          </label>
          <MultiSelect
            options={collectionOptions}
            value={selectedCollections}
            onChange={handleCollectionsChange}
            placeholder={
              collectionOptions.length ? "Select collections..." : "No collections"
            }
            searchPlaceholder="Search collections..."
            disabled={collectionOptions.length === 0}
          />
        </div>

        {/* Job Experience */}
        <div className="flex flex-col w-full md:w-1/4">
          <label className="mb-1 text-sm font-semibold text-gray-700">
            Job Experience
          </label>
          <MultiSelect
            options={experienceOptions}
            value={selectedJobExperience}
            onChange={handleExperienceChange}
            placeholder="Select experience..."
            searchPlaceholder="Search experience..."
          />
        </div>

        {/* Bookmarked filter */}
        <div className="flex items-center">
          <label className="flex items-center text-sm font-semibold text-gray-700">
            <Checkbox
              checked={bookmarked === true}
              onChange={handleBookmarkedChange}
              className="mr-2"
            />
            Only bookmarked jobs
          </label>
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;
