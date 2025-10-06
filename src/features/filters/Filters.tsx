import React, { useState, useCallback } from "react";
import Select from "react-select";
import { JobStatus, JobExperience } from "../../models";
import { camelToCapitalizedWords, debounce } from "../../utils";

export type JobType = "Fixed Price" | "Hourly Rate" | "Unspecified" | "None";

interface FilterComponentProps {
  onFilterChange: (
    jobType: JobType,
    fixedPriceRange: [number, number] | null,
    hourlyRateRange: [number, number] | null,
    selectedSkills: string[],
    selectedInstruments: string[],
    selectedStatuses: JobStatus[],
    selectedExperience: JobExperience[],
    titleFilter: string,
    bookmarked: boolean,
  ) => void;
  availableSkills: string[];
  availableInstruments: string[];
  availableStatuses: JobStatus[];
}

const INITIAL_HOURLY_RATE_MAX = 500;
const INITIAL_FIXED_PRICE_MAX = 5000;

export const FilterComponent: React.FC<FilterComponentProps> = ({
  onFilterChange,
  availableSkills,
  availableInstruments,
  availableStatuses,
}) => {
  const [jobType, setJobType] = useState<JobType>("None");
  const [fixedPriceRange, setFixedPriceRange] = useState<
    [number, number] | null
  >([0, INITIAL_FIXED_PRICE_MAX]);
  const [hourlyRateRange, setHourlyRateRange] = useState<
    [number, number] | null
  >([0, INITIAL_HOURLY_RATE_MAX]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<JobStatus[]>([]);
  const [selectedJobExperience, setSelectedJobExperience] = useState<
    JobExperience[]
  >([]);
  const [titleFilter, setTitleFilter] = useState<string>("");
  const [bookmarked, setBookmarked] = useState<boolean>(false);

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

  const experienceOptions = Object.values(JobExperience).map((exp) => ({
    value: exp,
    label: exp,
  }));

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
      selectedJobExperience,
      titleFilter,
      bookmarked,
    );
  };

  const handleSkillsChange = (selectedOptions: any) => {
    const skills = selectedOptions
      ? selectedOptions.map((option: any) => option.value)
      : [];
    setSelectedSkills(skills);
    onFilterChange(
      jobType,
      fixedPriceRange,
      hourlyRateRange,
      skills,
      selectedInstruments,
      selectedStatuses,
      selectedJobExperience,
      titleFilter,
      bookmarked,
    );
  };

  const handleInstrumentsChange = (selectedOptions: any) => {
    const instruments = selectedOptions
      ? selectedOptions.map((option: any) => option.value)
      : [];
    setSelectedInstruments(instruments);
    onFilterChange(
      jobType,
      fixedPriceRange,
      hourlyRateRange,
      selectedSkills,
      instruments,
      selectedStatuses,
      selectedJobExperience,
      titleFilter,
      bookmarked,
    );
  };

  const handleStatusesChange = (selectedOptions: any) => {
    const statuses = selectedOptions
      ? selectedOptions.map((option: any) => option.value)
      : [];
    setSelectedStatuses(statuses);
    onFilterChange(
      jobType,
      fixedPriceRange,
      hourlyRateRange,
      selectedSkills,
      selectedInstruments,
      statuses,
      selectedJobExperience,
      titleFilter,
      bookmarked,
    );
  };

  const handleExperienceChange = (selectedOptions: any) => {
    const experiences = selectedOptions
      ? selectedOptions.map((option: any) => option.value)
      : [];
    setSelectedJobExperience(experiences);
    onFilterChange(
      jobType,
      fixedPriceRange,
      hourlyRateRange,
      selectedSkills,
      selectedInstruments,
      selectedStatuses,
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
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
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
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
            value={jobType}
            onChange={(e) => handleJobTypeChange(e.target.value as JobType)}
          >
            <option value="Fixed Price">Fixed Price</option>
            <option value="Hourly Rate">Hourly Rate</option>
            <option value="Unspecified">Unspecified</option>
            <option value="None">None</option>
          </select>
        </div>

        {/* Fixed Price Range */}
        {jobType === "Fixed Price" && (
          <div className="flex flex-col w-full md:w-1/2">
            <label className="mb-1 text-sm font-semibold text-gray-700">
              Fixed Price Range
            </label>
            <div className="flex items-center space-x-3">
              <input
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
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
                placeholder="Min Price"
              />
              <span className="text-sm text-gray-700">to</span>
              <input
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
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
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
                <input
                  type="range"
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-16 text-sm text-gray-700">
                  ${hourlyRateRange ? hourlyRateRange[0] : 0}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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
          <Select
            isMulti
            options={skillOptions}
            value={skillOptions.filter((option) =>
              selectedSkills.includes(option.value),
            )}
            onChange={handleSkillsChange}
            placeholder="Select skills..."
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Instruments */}
        <div className="flex flex-col w-full md:w-1/4">
          <label className="mb-1 text-sm font-semibold text-gray-700">
            Instruments
          </label>
          <Select
            isMulti
            options={instrumentOptions}
            value={instrumentOptions.filter((option) =>
              selectedInstruments.includes(option.value),
            )}
            onChange={handleInstrumentsChange}
            placeholder="Select instruments..."
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Job Statuses */}
        <div className="flex flex-col w-full md:w-1/4">
          <label className="mb-1 text-sm font-semibold text-gray-700">
            Job Statuses
          </label>
          <Select
            isMulti
            options={statusOptions}
            value={statusOptions.filter((option) =>
              selectedStatuses.includes(option.value),
            )}
            onChange={handleStatusesChange}
            placeholder="Select statuses..."
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Job Experience */}
        <div className="flex flex-col w-full md:w-1/4">
          <label className="mb-1 text-sm font-semibold text-gray-700">
            Job Experience
          </label>
          <Select
            isMulti
            options={experienceOptions}
            value={experienceOptions.filter((option) =>
              selectedJobExperience.includes(option.value),
            )}
            onChange={handleExperienceChange}
            placeholder="Select experience..."
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Bookmarked filter */}
        <div className="flex items-center">
          <label className="flex items-center text-sm font-semibold text-gray-700">
            <input
              type="checkbox"
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
