import React, { useEffect, useState } from "react";
import { JobStatus, JobExperience } from "../../models";
import {
  Checkbox,
  FormField,
  MultiSelect,
  NumberField,
  RadixSelect as Select,
  RadixSelectContent as SelectContent,
  RadixSelectItem as SelectItem,
  RadixSelectTrigger as SelectTrigger,
  RadixSelectValue as SelectValue,
  RangeInput,
} from "../../shared/ui";
import { camelToCapitalizedWords } from "../../utils";
import { FilterState, JobType } from "./types";

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
  showCollectionsFilter?: boolean;
}

const INITIAL_HOURLY_RATE_MAX = 500;
const INITIAL_FIXED_PRICE_MAX = 5000;

const JOB_TYPE_OPTIONS: JobType[] = [
  "None",
  "Fixed Price",
  "Hourly Rate",
  "Unspecified",
];

type FieldProps = {
  label: React.ReactNode;
  children: React.ReactNode;
};

const Field: React.FC<FieldProps> = ({ label, children }) => (
  <label className="flex flex-col gap-item">
    <span className="text-label text-text-muted">{label}</span>
    {children}
  </label>
);

type FilterSectionProps = {
  title: string;
  children: React.ReactNode;
};

const FilterSection: React.FC<FilterSectionProps> = ({ title, children }) => (
  <section className="space-y-component">
    <h3 className="text-heading text-text-primary">{title}</h3>
    {children}
  </section>
);

export const FilterComponent: React.FC<FilterComponentProps> = ({
  onFilterChange,
  availableSkills,
  availableInstruments,
  availableStatuses,
  availableCollections,
  initialFilters,
  showCollectionsFilter = true,
}) => {
  const [jobType, setJobType] = useState<JobType>(
    initialFilters?.jobType ?? "None",
  );
  const [fixedPriceRange, setFixedPriceRange] = useState<
    [number, number] | null
  >(initialFilters?.fixedPriceRange ?? [0, INITIAL_FIXED_PRICE_MAX]);
  const [hourlyRateRange, setHourlyRateRange] = useState<
    [number, number] | null
  >(initialFilters?.hourlyRateRange ?? [0, INITIAL_HOURLY_RATE_MAX]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    initialFilters?.selectedSkills ?? [],
  );
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(
    initialFilters?.selectedInstruments ?? [],
  );
  const [selectedStatuses, setSelectedStatuses] = useState<JobStatus[]>(
    initialFilters?.selectedStatuses ?? [],
  );
  const [selectedCollections, setSelectedCollections] = useState<number[]>(
    initialFilters?.selectedCollectionIds ?? [],
  );
  const [selectedJobExperience, setSelectedJobExperience] = useState<
    JobExperience[]
  >(initialFilters?.selectedExperience ?? []);
  const [titleFilter, setTitleFilter] = useState<string>(
    initialFilters?.titleFilter ?? "",
  );
  const [bookmarked, setBookmarked] = useState<boolean>(
    initialFilters?.bookmarked ?? false,
  );

  useEffect(() => {
    if (!initialFilters) return;
    setJobType(initialFilters.jobType);
    setFixedPriceRange(
      initialFilters.fixedPriceRange ?? [0, INITIAL_FIXED_PRICE_MAX],
    );
    setHourlyRateRange(
      initialFilters.hourlyRateRange ?? [0, INITIAL_HOURLY_RATE_MAX],
    );
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

  const emitFilterChange = (nextFilters: Partial<FilterState>) => {
    const merged: FilterState = {
      jobType,
      fixedPriceRange,
      hourlyRateRange,
      selectedSkills,
      selectedInstruments,
      selectedStatuses,
      selectedCollectionIds: selectedCollections,
      selectedExperience: selectedJobExperience,
      titleFilter,
      bookmarked,
      ...nextFilters,
    };

    onFilterChange(
      merged.jobType,
      merged.fixedPriceRange,
      merged.hourlyRateRange,
      merged.selectedSkills,
      merged.selectedInstruments,
      merged.selectedStatuses,
      merged.selectedCollectionIds,
      merged.selectedExperience,
      merged.titleFilter,
      merged.bookmarked,
    );
  };

  useEffect(() => {
    setSelectedCollections((prev) => {
      const validIds = prev.filter((id) =>
        availableCollections.some((collection) => collection.id === id),
      );

      if (validIds.length !== prev.length) {
        emitFilterChange({ selectedCollectionIds: validIds });
      }

      return validIds;
    });
  }, [availableCollections]);

  const handleTitleFilterChange = (value: string) => {
    setTitleFilter(value);
    emitFilterChange({ titleFilter: value });
  };

  const handleJobTypeChange = (value: JobType) => {
    setJobType(value);
    emitFilterChange({ jobType: value });
  };

  const handleFixedPriceChange = (min: number, max: number) => {
    const validatedMin = Math.max(0, min);
    const validatedMax = Math.max(validatedMin, max);
    const range: [number, number] = [validatedMin, validatedMax];

    setFixedPriceRange(range);
    emitFilterChange({ fixedPriceRange: range });
  };

  const handleHourlyRateChange = (min: number, max: number) => {
    const validatedMin = Math.max(0, min);
    const validatedMax = Math.max(validatedMin, max);
    const range: [number, number] = [validatedMin, validatedMax];

    setHourlyRateRange(range);
    emitFilterChange({ hourlyRateRange: range });
  };

  const handleSkillsChange = (skills: string[]) => {
    setSelectedSkills(skills);
    emitFilterChange({ selectedSkills: skills });
  };

  const handleInstrumentsChange = (instruments: string[]) => {
    setSelectedInstruments(instruments);
    emitFilterChange({ selectedInstruments: instruments });
  };

  const handleStatusesChange = (statuses: JobStatus[]) => {
    setSelectedStatuses(statuses);
    emitFilterChange({ selectedStatuses: statuses });
  };

  const handleCollectionsChange = (collections: number[]) => {
    setSelectedCollections(collections);
    emitFilterChange({ selectedCollectionIds: collections });
  };

  const handleExperienceChange = (experiences: JobExperience[]) => {
    setSelectedJobExperience(experiences);
    emitFilterChange({ selectedExperience: experiences });
  };

  const handleBookmarkedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextBookmarked = event.target.checked;
    setBookmarked(nextBookmarked);
    emitFilterChange({ bookmarked: nextBookmarked });
  };

  const fixedPriceMin = fixedPriceRange?.[0] ?? 0;
  const fixedPriceMax = fixedPriceRange?.[1] ?? INITIAL_FIXED_PRICE_MAX;
  const hourlyRateMin = hourlyRateRange?.[0] ?? 0;
  const hourlyRateMax = hourlyRateRange?.[1] ?? INITIAL_HOURLY_RATE_MAX;

  return (
    <div className="space-y-card">
      <FilterSection title="Basics">
        <div className="grid gap-component md:grid-cols-2">
          <FormField
            label="Search in title"
            type="text"
            placeholder="Filter by job title..."
            value={titleFilter}
            onValueChange={handleTitleFilterChange}
          />

          <Field label="Job type">
            <Select
              value={jobType}
              onValueChange={(value) => handleJobTypeChange(value as JobType)}
            >
              <SelectTrigger className="h-target">
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                {JOB_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </FilterSection>

      {jobType === "Fixed Price" && (
        <FilterSection title="Fixed Price">
          <div className="grid gap-component md:grid-cols-2">
            <NumberField
              label="Min price"
              min="0"
              max="5000"
              value={fixedPriceMin}
              onValueChange={(value) =>
                handleFixedPriceChange(value, fixedPriceMax)
              }
              placeholder="Min price"
            />
            <NumberField
              label="Max price"
              min="0"
              max="5000"
              value={fixedPriceMax}
              onValueChange={(value) =>
                handleFixedPriceChange(fixedPriceMin, value)
              }
              placeholder="Max price"
            />
          </div>
        </FilterSection>
      )}

      {jobType === "Hourly Rate" && (
        <FilterSection title="Hourly Rate">
          <div className="space-y-component">
            <Field label="Min hourly rate">
              <div className="flex items-center gap-control">
                <RangeInput
                  min="0"
                  max="500"
                  value={hourlyRateMin}
                  onChange={(event) =>
                    handleHourlyRateChange(
                      Number(event.target.value),
                      hourlyRateMax,
                    )
                  }
                />
                <span className="w-16 text-right text-data text-text-primary">
                  ${hourlyRateMin}
                </span>
              </div>
            </Field>
            <Field label="Max hourly rate">
              <div className="flex items-center gap-control">
                <RangeInput
                  min="0"
                  max="500"
                  value={hourlyRateMax}
                  onChange={(event) =>
                    handleHourlyRateChange(
                      hourlyRateMin,
                      Number(event.target.value),
                    )
                  }
                />
                <span className="w-16 text-right text-data text-text-primary">
                  ${hourlyRateMax}
                </span>
              </div>
            </Field>
          </div>
        </FilterSection>
      )}

      <FilterSection title="Matching">
        <div className="grid gap-component md:grid-cols-2">
          <Field label="Skills">
            <MultiSelect
              options={skillOptions}
              value={selectedSkills}
              onChange={handleSkillsChange}
              placeholder="Select skills..."
              searchPlaceholder="Search skills..."
            />
          </Field>

          <Field label="Instruments">
            <MultiSelect
              options={instrumentOptions}
              value={selectedInstruments}
              onChange={handleInstrumentsChange}
              placeholder="Select instruments..."
              searchPlaceholder="Search instruments..."
            />
          </Field>

          <Field label="Job statuses">
            <MultiSelect
              options={statusOptions}
              value={selectedStatuses}
              onChange={handleStatusesChange}
              placeholder="Select statuses..."
              searchPlaceholder="Search statuses..."
            />
          </Field>

          {showCollectionsFilter ? (
            <Field label="Collections">
              <MultiSelect
                options={collectionOptions}
                value={selectedCollections}
                onChange={handleCollectionsChange}
                placeholder={
                  collectionOptions.length
                    ? "Select collections..."
                    : "No collections"
                }
                searchPlaceholder="Search collections..."
                disabled={collectionOptions.length === 0}
              />
            </Field>
          ) : null}

          <Field label="Job experience">
            <MultiSelect
              options={experienceOptions}
              value={selectedJobExperience}
              onChange={handleExperienceChange}
              placeholder="Select experience..."
              searchPlaceholder="Search experience..."
            />
          </Field>

          <label className="flex min-h-target items-center gap-item rounded-control bg-block-subtle px-component py-control text-ui text-text-secondary transition-colors duration-motion-fast ease-motion-standard hover:bg-fill-tertiary">
            <Checkbox
              checked={bookmarked}
              onChange={handleBookmarkedChange}
            />
            Only bookmarked jobs
          </label>
        </div>
      </FilterSection>
    </div>
  );
};

export default FilterComponent;
