import React, { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { JobExperience, JobStatus } from "../../models";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  OverlayBody,
  OverlayFooter,
  OverlayHeader,
  ScrollArea,
} from "../../shared/ui";
import Filters from "./Filters";
import { DEFAULT_FILTERS, FilterState } from "./types";

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
  badgePlacement?: "before-button" | "after-button";
  buttonLabel?: string;
  buttonVariant?: "primary" | "ghost" | "soft";
  emptyLabel?: React.ReactNode;
  showButtonIcon?: boolean;
  showCollectionsFilter?: boolean;
  className?: string;
};

const FiltersLauncher: React.FC<FiltersLauncherProps> = ({
  activeFilters,
  onFilterChange,
  availableSkills,
  availableInstruments,
  availableStatuses,
  availableCollections,
  collectionNameById,
  badgePlacement = "after-button",
  buttonLabel = "Filters",
  buttonVariant = "primary",
  emptyLabel = "No filters applied",
  showButtonIcon = false,
  showCollectionsFilter = true,
  className = "",
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
  const visibleBadges = badges.slice(0, 3);
  const hiddenBadgeCount = Math.max(0, badges.length - visibleBadges.length);

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

  const handleClear = () => {
    onFilterChange(
      DEFAULT_FILTERS.jobType,
      DEFAULT_FILTERS.fixedPriceRange,
      DEFAULT_FILTERS.hourlyRateRange,
      DEFAULT_FILTERS.selectedSkills,
      DEFAULT_FILTERS.selectedInstruments,
      DEFAULT_FILTERS.selectedStatuses,
      DEFAULT_FILTERS.selectedCollectionIds,
      DEFAULT_FILTERS.selectedExperience,
      DEFAULT_FILTERS.titleFilter,
      DEFAULT_FILTERS.bookmarked,
    );
    setPendingFilters(DEFAULT_FILTERS);
    setFiltersModalOpen(false);
  };

  const filterButton = (
    <Button
      size="sm"
      variant={buttonVariant}
      className="gap-item"
      onClick={() => setFiltersModalOpen(true)}
    >
      {showButtonIcon ? <SlidersHorizontal className="h-4 w-4" /> : null}
      <span>
        {buttonLabel}
        {badges.length ? ` (${badges.length})` : ""}
      </span>
    </Button>
  );

  const badgeList = (
    <div className="flex min-w-0 flex-wrap items-center gap-item">
      {badges.length === 0 ? (
        emptyLabel ? (
          <span className="text-body text-text-muted">{emptyLabel}</span>
        ) : null
      ) : (
        visibleBadges.map((badge) => (
          <Badge
            key={badge}
            tone="info"
            className="max-w-search-compact text-action"
          >
            <span className="truncate">{badge}</span>
          </Badge>
        ))
      )}
      {hiddenBadgeCount > 0 && (
        <Badge tone="neutral">+{hiddenBadgeCount}</Badge>
      )}
    </div>
  );

  return (
    <>
      <div
        className={`flex min-w-0 flex-wrap items-center gap-control ${className}`}
      >
        {badgePlacement === "before-button" ? badgeList : null}
        {filterButton}
        {badgePlacement === "after-button" ? badgeList : null}
        {badges.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>

      <Dialog open={isFiltersModalOpen} onOpenChange={setFiltersModalOpen}>
        <DialogContent className="max-h-overlay max-w-modal-xl gap-0 overflow-hidden p-0">
          <OverlayHeader className="text-center sm:text-left">
            <DialogTitle>Filters</DialogTitle>
          </OverlayHeader>
          <ScrollArea className="max-h-overlay-body">
            <OverlayBody>
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
                showCollectionsFilter={showCollectionsFilter}
              />
            </OverlayBody>
          </ScrollArea>
          <OverlayFooter className="flex flex-col-reverse gap-control sm:flex-row sm:justify-end sm:space-x-0">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Close
            </Button>
            <Button size="sm" disabled={!isDirty} onClick={handleApply}>
              Apply
            </Button>
          </OverlayFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FiltersLauncher;
