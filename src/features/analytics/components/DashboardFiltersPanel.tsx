import React from 'react';
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
}) => (
  <Filters
    onFilterChange={onFilterChange}
    availableSkills={availableSkills}
    availableInstruments={availableInstruments}
    availableStatuses={availableStatuses}
  />
);

export default DashboardFiltersPanel;
