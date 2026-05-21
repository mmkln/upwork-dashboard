import React, { useEffect, useMemo, useState } from "react";
import {
  UpworkJob,
  JobStatus,
  JobExperience,
  PreparedUpworkJob,
  JobCollection,
} from "../../models";
import { JobDetails, JobExportActions } from "../../components";
import { createJobCollection } from "../../services";
import {
  FiltersLauncher,
  JobType,
  FilterState,
  useFilters,
  useCollections,
  useJobFacets,
  useJobsPage,
} from "../../features";
import { instruments, prepareJobs } from "../../utils";
import { buildFilterSlug } from "../../features/filters/utils/filterSlug.util";
import CollectionsDropdown from "./components/CollectionsDropdown";
import JobListItem from "./components/JobListItem";
import {
  Button,
  ContentToolbar,
  EmptyState,
  PageShell,
  Select,
  VirtualGrid,
} from "../../shared/ui";

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200, 2000];
const FACETS_PAGE_SIZE = 2000;
const JOB_CARD_ESTIMATED_HEIGHT = 320;

const sortCollectionsByName = (collections: JobCollection[]) =>
  [...collections].sort((left, right) => left.name.localeCompare(right.name));

const SkeletonBlock: React.FC<{ className: string }> = ({ className }) => (
  <div className={`animate-pulse rounded-block bg-block-subtle ${className}`} />
);

const JobCardSkeleton: React.FC = () => (
  <div className="h-full rounded-block bg-block p-block">
    <div className="flex h-full flex-col gap-card">
      <div className="flex items-start justify-between gap-control">
        <div className="flex flex-wrap gap-item">
          <SkeletonBlock className="h-5 w-20 rounded-full" />
          <SkeletonBlock className="h-5 w-24 rounded-full" />
        </div>
        <SkeletonBlock className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-item">
        <SkeletonBlock className="h-5 w-11/12" />
        <SkeletonBlock className="h-5 w-8/12" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-10/12" />
      </div>
      <div className="flex flex-wrap gap-tag">
        <SkeletonBlock className="h-5 w-16 rounded-full" />
        <SkeletonBlock className="h-5 w-20 rounded-full" />
        <SkeletonBlock className="h-5 w-14 rounded-full" />
      </div>
      <div className="mt-auto border-t border-border pt-component">
        <div className="flex items-center justify-between gap-control">
          <SkeletonBlock className="h-8 w-36" />
          <SkeletonBlock className="h-8 w-28 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

const JobList: React.FC = () => {
  const { filters: activeFilters, setFilters } = useFilters();
  const { collections, setCollections, refreshCollections } = useCollections();
  const [selectedJob, setSelectedJob] = useState<PreparedUpworkJob | null>(null);
  const [lastClickedJobId, setLastClickedJobId] = useState<string | null>(null);
  const [lastFilterSlug, setLastFilterSlug] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[1]);
  const {
    jobs: jobsData,
    totalJobs,
    totalPages,
    isLoading,
    replaceJob,
  } = useJobsPage({
    filters: activeFilters,
    page,
    pageSize,
  });
  const { facets } = useJobFacets({ pageSize: FACETS_PAGE_SIZE });
  const filteredJobsData = jobsData;
  const availableStatuses = useMemo(() => Object.values(JobStatus), []);
  const availableInstruments = useMemo(
    () =>
      instruments.map((toolEntry) =>
        Array.isArray(toolEntry) ? toolEntry[0] : toolEntry,
      ),
    [],
  );

  const collectionNameById = useMemo(() => {
    return collections.reduce<Record<number, string>>((acc, collection) => {
      acc[collection.id] = collection.name;
      return acc;
    }, {});
  }, [collections]);

  useEffect(() => {
    refreshCollections();
  }, [refreshCollections]);

  const updateJob = (job: UpworkJob) => {
    const preparedJob = replaceJob(job);
    setSelectedJob((prev) => (prev?.id === preparedJob.id ? preparedJob : prev));
  };

  const openJobDetails = (job: UpworkJob) => {
    const existing = jobsData.find((item) => item.id === job.id);
    if (existing) {
      setSelectedJob(existing);
    } else {
      const [preparedJob] = prepareJobs([job]);
      setSelectedJob(preparedJob);
    }
    setLastClickedJobId(job.id);
  };

  const closeJobDetails = () => {
    setSelectedJob(null);
  };

  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages || totalJobs === 0;
  const skeletonCount = Math.min(pageSize, 8);
  const firstVisibleJob = totalJobs === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastVisibleJob =
    totalJobs === 0 ? 0 : Math.min(page * pageSize, totalJobs);

  const goToPage = (nextPage: number) => {
    const safePage = Math.min(Math.max(1, nextPage), totalPages || 1);
    if (safePage !== page) {
      setPage(safePage);
      setLastClickedJobId(null);
      setSelectedJob(null);
    }
  };

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newSize = Number(event.target.value);
    if (!Number.isNaN(newSize) && newSize > 0) {
      setPageSize(newSize);
      setPage(1);
    }
  };

  const applyFilters = (nextFilters: FilterState) => {
    setFilters(nextFilters);
    setLastFilterSlug(buildFilterSlug(nextFilters, collectionNameById));
    setPage(1);
  };

  const handleCollectionChange = (selectedCollectionIds: number[]) => {
    applyFilters({
      ...activeFilters,
      selectedCollectionIds,
    });
  };

  const handleCreateCollection = async (
    name: string,
    description: string,
  ) => {
    const createdCollection = await createJobCollection({
      name,
      description,
    });

    setCollections((currentCollections) =>
      sortCollectionsByName([
        ...currentCollections.filter(
          (collection) => collection.id !== createdCollection.id,
        ),
        createdCollection,
      ]),
    );
    void refreshCollections();

    return createdCollection;
  };

  const onFilterChanged = (
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
  ) => {
    const nextFilters: FilterState = {
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
    };
    applyFilters(nextFilters);
  };

  useEffect(() => {
    setLastFilterSlug(buildFilterSlug(activeFilters, collectionNameById));
    setPage(1);
  }, [activeFilters, collectionNameById]);

  return (
    <PageShell>
      <ContentToolbar className="rounded-none bg-transparent p-0">
        <div className="flex flex-col gap-component xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-control">
            <div className="min-w-0 space-y-micro">
              <p className="text-ui text-text-primary">
                {isLoading ? (
                  "Loading jobs..."
                ) : (
                  <>
                    <span className="tabular-nums">
                      {totalJobs.toLocaleString()}
                    </span>{" "}
                    jobs
                  </>
                )}
              </p>
              <p className="text-label text-text-muted">
                {isLoading
                  ? "Preparing current page"
                : `Showing ${firstVisibleJob}-${lastVisibleJob} | Page ${page} of ${totalPages}`}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-control xl:justify-end">
            <FiltersLauncher
              activeFilters={activeFilters}
              onFilterChange={onFilterChanged}
              availableSkills={facets.skills}
              availableInstruments={availableInstruments}
              availableStatuses={availableStatuses}
              availableCollections={collections}
              collectionNameById={collectionNameById}
              badgePlacement="before-button"
              buttonLabel="Filter"
              buttonVariant="soft"
              emptyLabel={null}
              showButtonIcon
              showCollectionsFilter={false}
              className="justify-start xl:justify-end"
            />

            <JobExportActions
              jobs={filteredJobsData}
              filterDescriptor={lastFilterSlug || "all"}
            />

            <label className="flex items-center gap-item text-ui text-text-secondary">
              Page size
              <Select
                className="w-auto"
                value={pageSize}
                onChange={handlePageSizeChange}
                disabled={isLoading}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Select>
            </label>

            <div className="flex items-center gap-item">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToPage(page - 1)}
                disabled={isFirstPage || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => goToPage(page + 1)}
                disabled={isLastPage || isLoading}
              >
                Next
              </Button>
            </div>

            <CollectionsDropdown
              collections={collections}
              selectedCollectionIds={activeFilters.selectedCollectionIds}
              totalJobs={totalJobs}
              onCollectionChange={handleCollectionChange}
              onCreateCollection={handleCreateCollection}
            />
          </div>
        </div>
      </ContentToolbar>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-component sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <JobCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredJobsData.length > 0 ? (
        <VirtualGrid
          items={filteredJobsData}
          getKey={(job) => job.id}
          estimateItemHeight={JOB_CARD_ESTIMATED_HEIGHT}
          gap={16}
          className="w-full"
          renderItem={(job) => (
            <JobListItem
              job={job}
              onClick={openJobDetails}
              onJobUpdate={updateJob}
              isLastClicked={lastClickedJobId === job.id}
              collectionNameById={collectionNameById}
            />
          )}
        />
      ) : (
        <EmptyState
          title="No jobs found"
          description="Try changing filters or page size to see more opportunities."
        />
      )}

      {selectedJob && (
        <JobDetails
          job={selectedJob}
          isOpen={true}
          onClose={closeJobDetails}
          onJobUpdate={updateJob}
          collectionNameById={collectionNameById}
          availableCollections={collections}
        />
      )}
    </PageShell>
  );
};

export default JobList;
