import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import Filters from "./Filters";
import { FilterState } from "./types";
import { JobExperience, JobStatus } from "../../models";

Modal.setAppElement?.("#root");

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
  const [pendingFilters, setPendingFilters] = useState<FilterState>(activeFilters);
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
    if (activeFilters.jobType === "Fixed Price" && activeFilters.fixedPriceRange) {
      list.push(
        `Fixed $${activeFilters.fixedPriceRange[0]}-${activeFilters.fixedPriceRange[1]}`,
      );
    }
    if (activeFilters.jobType === "Hourly Rate" && activeFilters.hourlyRateRange) {
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

  return (
    <>
      <div className="flex items-center justify-end gap-3 px-6 py-4">
        <div className="flex flex-wrap gap-2 justify-end max-w-3xl">
          {badges.length === 0 ? (
            <span className="text-sm text-gray-500">No filters applied</span>
          ) : (
            badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
              >
                {badge}
              </span>
            ))
          )}
        </div>
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => setFiltersModalOpen(true)}
        >
          Filters
        </button>
      </div>

      <Modal
        isOpen={isFiltersModalOpen}
        onRequestClose={() => setFiltersModalOpen(false)}
        overlayClassName="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-start justify-center overflow-y-auto"
        className="relative w-full max-w-5xl p-6 mt-10 mb-10 bg-white rounded-lg shadow-xl outline-none"
      >
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setFiltersModalOpen(false)}
          >
            ×
          </button>
        </div>
        <div className="pt-4">
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
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50"
            onClick={() => {
              setPendingFilters(activeFilters);
              setFiltersModalOpen(false);
            }}
          >
            Close
          </button>
          <button
            className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={!isDirty}
            onClick={() => {
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
            }}
          >
            Apply
          </button>
        </div>
      </Modal>
    </>
  );
};

export default FiltersLauncher;
