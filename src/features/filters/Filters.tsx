import React, { useState } from "react";
import Select from "react-select";

export type JobType = "Fixed Price" | "Hourly Rate" | "Unspecified" | "None";

interface FilterComponentProps {
  onFilterChange: (
    jobType: JobType,
    fixedPriceRange: [number, number] | null,
    hourlyRateRange: [number, number] | null,
    selectedSkills: string[],
  ) => void;
  availableSkills: string[];
}

const INITIAL_HOURLY_RATE_MAX = 500;
const INITIAL_FIXED_PRICE_MAX = 5000;

export const FilterComponent: React.FC<FilterComponentProps> = ({
  onFilterChange,
  availableSkills,
}) => {
  const [jobType, setJobType] = useState<JobType>("None");
  const [fixedPriceRange, setFixedPriceRange] = useState<
    [number, number] | null
  >([0, INITIAL_FIXED_PRICE_MAX]);
  const [hourlyRateRange, setHourlyRateRange] = useState<
    [number, number] | null
  >([0, INITIAL_HOURLY_RATE_MAX]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const skillOptions = availableSkills.map((skill) => ({
    value: skill,
    label: skill,
  }));

  const handleJobTypeChange = (value: JobType) => {
    setJobType(value);
    onFilterChange(value, fixedPriceRange, hourlyRateRange, selectedSkills);
  };

  const handleFixedPriceChange = (min: number, max: number) => {
    const range: [number, number] = [min, max];
    setFixedPriceRange(range);
    onFilterChange(jobType, range, hourlyRateRange, selectedSkills);
  };

  const handleHourlyRateChange = (min: number, max: number) => {
    const range: [number, number] = [min, max];
    setHourlyRateRange(range);
    onFilterChange(jobType, fixedPriceRange, range, selectedSkills);
  };

  const handleSkillsChange = (selectedOptions: any) => {
    const skills = selectedOptions
      ? selectedOptions.map((option: any) => option.value)
      : [];
    setSelectedSkills(skills);
    onFilterChange(jobType, fixedPriceRange, hourlyRateRange, skills);
  };

  return (
    <div className="bg-white rounded-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Job Type */}
        <div className="flex flex-col">
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
          <div className="md:col-span-2 flex flex-col">
            <label className="mb-1 text-sm font-semibold text-gray-700">
              Fixed Price Range
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <input
                  type="range"
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-16 text-sm text-gray-700">
                  ${fixedPriceRange ? fixedPriceRange[0] : 0}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="range"
                  min="0"
                  max="5000"
                  value={
                    fixedPriceRange
                      ? fixedPriceRange[1]
                      : INITIAL_FIXED_PRICE_MAX
                  }
                  onChange={(e) =>
                    handleFixedPriceChange(
                      fixedPriceRange ? fixedPriceRange[0] : 0,
                      Number(e.target.value),
                    )
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-16 text-sm text-gray-700">
                  $
                  {fixedPriceRange
                    ? fixedPriceRange[1]
                    : INITIAL_FIXED_PRICE_MAX}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Hourly Rate Range */}
        {jobType === "Hourly Rate" && (
          <div className="md:col-span-2 flex flex-col">
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
        <div className="flex flex-col">
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
      </div>
    </div>
  );
};

export default FilterComponent;
