import React, { useEffect, useMemo, useState } from "react";
import { JobExperience, JobStatus } from "../../models";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../shared/ui";
import Filters from "./Filters";
import { FilterState } from "./types";

type FiltersLauncherProps = {
  activeFilters: FilterState;
  onFilterChange: (
    jobType: FilterState["jobType"],
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
  collectionNameById: Record<number, string>;
};

const FiltersLauncher: React.FC<FiltersLauncherProps> = ({
  activeFilters,
  onFilterChange,
  availableSkills,
  availableInstruments,
  availableStatuses,
  availableCollections,
  collectionNameById,
}) => {
  const [isFiltersModalOpen, setFiltersModalOpen] = useState(false);
  const [pendingFilters, setPendingFilters] =
    useState<FilterState>(activeFilters);
  const isDirty = useMemo(
    () => JSON.stringify(pendingFilters) !== JSON.stringify(activeFilters),
    [pendingFilters, activeFilters],
  );

  useEffect(() => {
    if (!isFiltersModalOpen) {
      setPendingFilters(activeFilters);
    }
  }, [activeFilters, isFiltersModalOpen]);

  const badges = useMemo(() => {
    const list: string[] = [];

    if (activeFilters.jobType !== "None") {
      list.push(`Type: ${activeFilters.jobType}`);
    }
    if (
      activeFilters.jobType === "Fixed Price" &&
      activeFilters.fixedPriceRange
    ) {
      list.push(
        `Fixed $${activeFilters.fixedPriceRange[0]}-${activeFilters.fixedPriceRange[1]}`,
      );
    }
    if (
      activeFilters.jobType === "Hourly Rate" &&
      activeFilters.hourlyRateRange
    ) {
      list.push(
        `Hourly $${activeFilters.hourlyRateRange[0]}-${activeFilters.hourlyRateRange[1]}`,
      );
    }
    if (activeFilters.selectedSkills.length) {
      list.push(`Skills: ${activeFilters.selectedSkills.join(", ")}`);
    }
    if (activeFilters.selectedInstruments.length) {
      list.push(`Tools: ${activeFilters.selectedInstruments.join(", ")}`);
    }
    if (activeFilters.selectedStatuses.length) {
      list.push(`Statuses: ${activeFilters.selectedStatuses.join(", ")}`);
    }
    if (activeFilters.selectedCollectionIds.length) {
      const names = activeFilters.selectedCollectionIds
        .map((id) => collectionNameById[id] || `Collection ${id}`)
        .join(", ");
      list.push(`Collections: ${names}`);
    }
    if (activeFilters.selectedExperience.length) {
      list.push(`Experience: ${activeFilters.selectedExperience.join(", ")}`);
    }
    if (activeFilters.titleFilter.trim()) {
      list.push(`Search: "${activeFilters.titleFilter.trim()}"`);
    }
    if (activeFilters.bookmarked) {
      list.push("Bookmarked only");
    }

    return list;
  }, [activeFilters, collectionNameById]);

  const handleClose = () => {
    setPendingFilters(activeFilters);
    setFiltersModalOpen(false);
  };

  const handleApply = () => {
    onFilterChange(
      pendingFilters.jobType,
      pendingFilters.fixedPriceRange,
      pendingFilters.hourlyRateRange,
      pendingFilters.selectedSkills,
      pendingFilters.selectedInstruments,
      pendingFilters.selectedStatuses,
      pendingFilters.selectedCollectionIds,
      pendingFilters.selectedExperience,
      pendingFilters.titleFilter,
      pendingFilters.bookmarked,
    );
    setFiltersModalOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-end gap-3 px-6 py-4">
        <div className="flex max-w-3xl flex-wrap justify-end gap-2">
          {badges.length === 0 ? (
            <span className="text-sm text-gray-500">No filters applied</span>
          ) : (
            badges.map((badge) => (
              <Badge key={badge} tone="info" className="px-3 py-1 text-blue-700">
                {badge}
              </Badge>
            ))
          )}
        </div>
        <Button size="md" onClick={() => setFiltersModalOpen(true)}>
          Filters
        </Button>
      </div>

      <Dialog open={isFiltersModalOpen} onOpenChange={setFiltersModalOpen}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto p-8">
          <DialogHeader className="border-b pb-6">
            <DialogTitle>Filters</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <Filters
              onFilterChange={(
                jobType,
                fixedPriceRange,
                hourlyRateRange,
                selectedSkills,
                selectedInstruments,
                selectedStatuses,
                selectedCollectionIds,
                selectedExperience,
                titleFilter,
                bookmarked,
              ) => {
                setPendingFilters({
                  jobType,
                  fixedPriceRange,
                  hourlyRateRange,
                  selectedSkills,
                  selectedInstruments,
                  selectedStatuses,
                  selectedCollectionIds,
                  selectedExperience,
                  titleFilter,
                  bookmarked,
                });
              }}
              initialFilters={pendingFilters}
              availableSkills={availableSkills}
              availableInstruments={availableInstruments}
              availableStatuses={availableStatuses}
              availableCollections={availableCollections}
            />
          </div>
          <DialogFooter className="gap-3 border-t pt-6 sm:space-x-0">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Close
            </Button>
            <Button size="sm" disabled={!isDirty} onClick={handleApply}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FiltersLauncher;
