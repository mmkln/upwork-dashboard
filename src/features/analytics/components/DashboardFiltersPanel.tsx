import React, { useState } from 'react';
import { Filters, JobType } from '../../../features';
import { JobStatus, JobExperience } from '../../../models';

interface DashboardFiltersPanelProps {
  onFilterChange: (
    jobType: JobType,
    fixedPriceRange: [number, number] | null,
    hourlyRateRange: [number, number] | null,
    selectedSkills: string[],
    selectedInstruments: string[],
    selectedStatuses: JobStatus[],
    selectedExperience: JobExperience[],
    minClientRating: number | null,
  ) => void;
  availableSkills: string[];
  availableInstruments: string[];
  availableStatuses: JobStatus[];
}

const DashboardFiltersPanel: React.FC<DashboardFiltersPanelProps> = ({
  onFilterChange,
  availableSkills,
  availableInstruments,
  availableStatuses,
}) => {
  // Manage internal filter parameters and client rating
  const [filterParams, setFilterParams] = useState({
    jobType: 'None' as JobType,
    fixedPriceRange: null as [number, number] | null,
    hourlyRateRange: null as [number, number] | null,
    selectedSkills: [] as string[],
    selectedInstruments: [] as string[],
    selectedStatuses: [] as JobStatus[],
    selectedExperience: [] as JobExperience[],
  });
  const [minClientRating, setMinClientRating] = useState<number | null>(null);

  const handleFiltersChange = (
    jobType: JobType,
    fixedPriceRange: [number, number] | null,
    hourlyRateRange: [number, number] | null,
    selectedSkills: string[],
    selectedInstruments: string[],
    selectedStatuses: JobStatus[],
    selectedExperience: JobExperience[],
  ) => {
    const params = { jobType, fixedPriceRange, hourlyRateRange, selectedSkills, selectedInstruments, selectedStatuses, selectedExperience };
    setFilterParams(params);
    onFilterChange(
      jobType,
      fixedPriceRange,
      hourlyRateRange,
      selectedSkills,
      selectedInstruments,
      selectedStatuses,
      selectedExperience,
      minClientRating,
    );
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rating = parseFloat(e.target.value);
    setMinClientRating(rating);
    const {
      jobType,
      fixedPriceRange,
      hourlyRateRange,
      selectedSkills,
      selectedInstruments,
      selectedStatuses,
      selectedExperience,
    } = filterParams;
    onFilterChange(
      jobType,
      fixedPriceRange,
      hourlyRateRange,
      selectedSkills,
      selectedInstruments,
      selectedStatuses,
      selectedExperience,
      rating,
    );
  };

  return (
    <div>
      <Filters
        onFilterChange={handleFiltersChange}
        availableSkills={availableSkills}
        availableInstruments={availableInstruments}
        availableStatuses={availableStatuses}
      />
      <div className="mt-4 flex items-center space-x-2">
        <label className="text-sm font-semibold">Client Rating ≥</label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={minClientRating ?? 0}
          onChange={handleRatingChange}
          className="w-full"
        />
        <span className="text-sm">{(minClientRating ?? 0).toFixed(1)}</span>
      </div>
    </div>
  );
};

export default DashboardFiltersPanel;
