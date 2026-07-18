import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
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
    createdAfter: string,
    createdBefore: string,
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

type FilterBadge = {
  id: string;
  label: string;
  onRemove: () => void;
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

  const applyFilters = useCallback(
    (nextFilters: FilterState) => {
      onFilterChange(
        nextFilters.jobType,
        nextFilters.fixedPriceRange,
        nextFilters.hourlyRateRange,
        nextFilters.selectedSkills,
        nextFilters.selectedInstruments,
        nextFilters.selectedStatuses,
        nextFilters.selectedCollectionIds,
        nextFilters.selectedExperience,
        nextFilters.titleFilter,
        nextFilters.createdAfter,
        nextFilters.createdBefore,
        nextFilters.bookmarked,
      );
    },
    [onFilterChange],
  );

  const badges = useMemo(() => {
    const list: FilterBadge[] = [];

    if (activeFilters.jobType !== "None") {
      list.push({
        id: "job-type",
        label: `Type: ${activeFilters.jobType}`,
        onRemove: () =>
          applyFilters({
            ...activeFilters,
            jobType: DEFAULT_FILTERS.jobType,
            fixedPriceRange: DEFAULT_FILTERS.fixedPriceRange,
            hourlyRateRange: DEFAULT_FILTERS.hourlyRateRange,
          }),
      });
    }
    if (
      activeFilters.jobType === "Fixed Price" &&
      activeFilters.fixedPriceRange
    ) {
      list.push({
        id: "fixed-price",
        label: `Fixed $${activeFilters.fixedPriceRange[0]}-${activeFilters.fixedPriceRange[1]}`,
        onRemove: () =>
          applyFilters({
            ...activeFilters,
            fixedPriceRange: DEFAULT_FILTERS.fixedPriceRange,
          }),
      });
    }
    if (
      activeFilters.jobType === "Hourly Rate" &&
      activeFilters.hourlyRateRange
    ) {
      list.push({
        id: "hourly-rate",
        label: `Hourly $${activeFilters.hourlyRateRange[0]}-${activeFilters.hourlyRateRange[1]}`,
        onRemove: () =>
          applyFilters({
            ...activeFilters,
            hourlyRateRange: DEFAULT_FILTERS.hourlyRateRange,
          }),
      });
    }
    if (activeFilters.selectedSkills.length) {
      list.push({
        id: "skills",
        label: `Skills: ${activeFilters.selectedSkills.join(", ")}`,
        onRemove: () =>
          applyFilters({
            ...activeFilters,
            selectedSkills: DEFAULT_FILTERS.selectedSkills,
          }),
      });
    }
    if (activeFilters.selectedInstruments.length) {
      list.push({
        id: "tools",
        label: `Tools: ${activeFilters.selectedInstruments.join(", ")}`,
        onRemove: () =>
          applyFilters({
            ...activeFilters,
            selectedInstruments: DEFAULT_FILTERS.selectedInstruments,
          }),
      });
    }
    if (activeFilters.selectedStatuses.length) {
      list.push({
        id: "statuses",
        label: `Statuses: ${activeFilters.selectedStatuses.join(", ")}`,
        onRemove: () =>
          applyFilters({
            ...activeFilters,
            selectedStatuses: DEFAULT_FILTERS.selectedStatuses,
          }),
      });
    }
    if (activeFilters.selectedCollectionIds.length) {
      const names = activeFilters.selectedCollectionIds
        .map((id) => collectionNameById[id] || `Collection ${id}`)
        .join(", ");
      list.push({
        id: "collections",
        label: `Collections: ${names}`,
        onRemove: () =>
          applyFilters({
            ...activeFilters,
            selectedCollectionIds: DEFAULT_FILTERS.selectedCollectionIds,
          }),
      });
    }
    if (activeFilters.selectedExperience.length) {
      list.push({
        id: "experience",
        label: `Experience: ${activeFilters.selectedExperience.join(", ")}`,
        onRemove: () =>
          applyFilters({
            ...activeFilters,
            selectedExperience: DEFAULT_FILTERS.selectedExperience,
          }),
      });
    }
    if (activeFilters.titleFilter.trim()) {
      list.push({
        id: "search",
        label: `Search: "${activeFilters.titleFilter.trim()}"`,
        onRemove: () =>
          applyFilters({
            ...activeFilters,
            titleFilter: DEFAULT_FILTERS.titleFilter,
          }),
      });
    }
    if (activeFilters.createdAfter) {
      list.push({
        id: "created-after",
        label: `From: ${activeFilters.createdAfter}`,
        onRemove: () =>
          applyFilters({
            ...activeFilters,
            createdAfter: DEFAULT_FILTERS.createdAfter,
          }),
      });
    }
    if (activeFilters.createdBefore) {
      list.push({
        id: "created-before",
        label: `To: ${activeFilters.createdBefore}`,
        onRemove: () =>
          applyFilters({
            ...activeFilters,
            createdBefore: DEFAULT_FILTERS.createdBefore,
          }),
      });
    }
    if (activeFilters.bookmarked) {
      list.push({
        id: "bookmarked",
        label: "Bookmarked only",
        onRemove: () =>
          applyFilters({
            ...activeFilters,
            bookmarked: DEFAULT_FILTERS.bookmarked,
          }),
      });
    }

    return list;
  }, [activeFilters, applyFilters, collectionNameById]);
  const visibleBadges = badges.slice(0, 3);
  const hiddenBadgeCount = Math.max(0, badges.length - visibleBadges.length);

  const handleClose = () => {
    setPendingFilters(activeFilters);
    setFiltersModalOpen(false);
  };

  const handleApply = () => {
    applyFilters(pendingFilters);
    setFiltersModalOpen(false);
  };

  const handleClear = () => {
    applyFilters(DEFAULT_FILTERS);
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
            key={badge.id}
            tone="info"
            className="max-w-search-compact gap-tag pr-tag text-action"
          >
            <span className="truncate">{badge.label}</span>
            <button
              type="button"
              className="inline-flex h-control-mini w-control-mini shrink-0 items-center justify-center rounded-full text-action/70 transition-colors duration-motion-fast ease-motion-standard hover:bg-action/10 hover:text-action focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label={`Remove ${badge.label} filter`}
              onClick={badge.onRemove}
            >
              <X className="h-3 w-3" />
            </button>
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
                  createdAfter,
                  createdBefore,
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
                    createdAfter,
                    createdBefore,
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
