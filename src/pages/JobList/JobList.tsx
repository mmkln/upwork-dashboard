// src/components/JobList.tsx
import React, { useEffect, useMemo, useState } from "react";
import { UpworkJob, JobStatus, JobExperience, PreparedUpworkJob } from "../../models";
import { fetchUpworkJobs } from "../../services";
import { JobDetails } from "../../components";
import {
  FiltersLauncher,
  JobType,
  FilterState,
  useFilters,
  useCollections,
} from "../../features";
import { JobListItem } from "./components";
import { instruments, prepareJobs } from "../../utils";
import { PageLoadingBar } from "../../components/ui";

const mapFiltersToQuery = (filters: FilterState) => {
  const params: Record<string, string | number | boolean | undefined> = {};

  if (filters.titleFilter.trim()) {
    params.search = filters.titleFilter.trim();
  }

  switch (filters.jobType) {
    case "Fixed Price":
      params.job_type = "fixed";
      if (filters.fixedPriceRange) {
        params.fixed_price_min = filters.fixedPriceRange[0];
        params.fixed_price_max = filters.fixedPriceRange[1];
      }
      break;
    case "Hourly Rate":
      params.job_type = "hourly";
      if (filters.hourlyRateRange) {
        params.hourly_rate_min = filters.hourlyRateRange[0];
        params.hourly_rate_max = filters.hourlyRateRange[1];
      }
      break;
    case "Unspecified":
      params.job_type = "unspecified";
      break;
    default:
      break;
  }

  if (filters.selectedSkills.length) {
    params.skills = filters.selectedSkills.join(",");
  }
  if (filters.selectedInstruments.length) {
    params.instruments = filters.selectedInstruments.join(",");
  }
  if (filters.selectedStatuses.length) {
    params.statuses = filters.selectedStatuses.join(",");
  }
  if (filters.selectedCollectionIds.length) {
    params.collections = filters.selectedCollectionIds.join(",");
  }
  if (filters.selectedExperience.length) {
    params.experience = filters.selectedExperience.join(",");
  }
  if (filters.bookmarked) {
    params.bookmarked = true;
  }

  return params;
};

const JobList: React.FC = () => {
  const PAGE_SIZE_OPTIONS = [20, 50, 100, 200, 2000];
  const { filters: activeFilters, setFilters } = useFilters();
  const { collections, refreshCollections } = useCollections();
  const [jobsData, setJobsData] = useState<PreparedUpworkJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedJob, setSelectedJob] = useState<PreparedUpworkJob | null>(null);
  const [filteredJobsData, setFilteredJobsData] =
    useState<PreparedUpworkJob[]>([]);
  const [lastClickedJobId, setLastClickedJobId] = useState<string | null>(null);
  const [lastFilterSlug, setLastFilterSlug] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[1]);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const availableStatuses = Object.values(JobStatus);
  const availableInstruments: string[] = instruments.map((toolEntry) =>
    Array.isArray(toolEntry) ? toolEntry[0] : toolEntry,
  );

  const collectionNameById = useMemo(() => {
    return collections.reduce<Record<number, string>>((acc, collection) => {
      acc[collection.id] = collection.name;
      return acc;
    }, {});
  }, [collections]);

  useEffect(() => {
    let isMounted = true;
    const loadJobs = async () => {
      setLoading(true);
      try {
        const paginatedJobs = await fetchUpworkJobs({
          page,
          page_size: pageSize,
          ...mapFiltersToQuery(activeFilters),
        });
        if (!isMounted) return;

        const preparedJobs = prepareJobs(paginatedJobs.results);
        const sortedJobs = sortJobs(preparedJobs);
        setJobsData(sortedJobs);
        setFilteredJobsData(sortedJobs);
        setTotalJobs(paginatedJobs.count);
        const totalPageCount =
          paginatedJobs.count > 0
            ? Math.ceil(paginatedJobs.count / pageSize)
            : 1;
        if (page > totalPageCount) {
          setPage(totalPageCount);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching jobs:", error);
          setJobsData([]);
          setFilteredJobsData([]);
          setTotalJobs(0);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadJobs();

    return () => {
      isMounted = false;
    };
  }, [page, pageSize, activeFilters]);

  useEffect(() => {
    refreshCollections();
  }, [refreshCollections]);

  const sortJobs = (jobs: PreparedUpworkJob[]): PreparedUpworkJob[] => {
    return jobs.reverse();
  };

  const updateJob = (job: UpworkJob) => {
    const [preparedJob] = prepareJobs([job]);
    const updatedJobs = jobsData.map((j) =>
      j.id === preparedJob.id ? preparedJob : j,
    );
    setJobsData(updatedJobs);
    const updatedFilteredJobs = filteredJobsData.map((j) =>
      j.id === preparedJob.id ? preparedJob : j,
    );
    setFilteredJobsData(updatedFilteredJobs);
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

  // Отримуємо унікальний список скілів із jobsData
  const availableSkills = useMemo(
    () => Array.from(new Set(jobsData.flatMap((job) => job.skills))),
    [jobsData],
  );

  function buildFilterSlug(
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
    collectionsLookup: Record<number, string>,
  ): string {
    const parts: string[] = [];

    if (jobType && jobType !== "None") {
      parts.push(`type-${jobType.replace(/\s+/g, "-").toLowerCase()}`);
    }

    const isDefaultFixed =
      fixedPriceRange &&
      fixedPriceRange[0] === 0 &&
      fixedPriceRange[1] === 5000;
    const isDefaultHourly =
      hourlyRateRange &&
      hourlyRateRange[0] === 0 &&
      hourlyRateRange[1] === 500;

    if (jobType === "Fixed Price" && fixedPriceRange && !isDefaultFixed) {
      parts.push(`fixed-${fixedPriceRange[0]}-${fixedPriceRange[1]}`);
    }
    if (jobType === "Hourly Rate" && hourlyRateRange && !isDefaultHourly) {
      parts.push(`hourly-${hourlyRateRange[0]}-${hourlyRateRange[1]}`);
    }
    if (selectedSkills.length) {
      parts.push(`skills-${selectedSkills.join("+")}`);
    }
    if (selectedInstruments.length) {
      parts.push(`tools-${selectedInstruments.join("+")}`);
    }
    if (selectedStatuses.length) {
      parts.push(`status-${selectedStatuses.join("+")}`);
    }
    if (selectedCollectionIds.length) {
      const names = selectedCollectionIds
        .map((id) => collectionsLookup[id] || `id${id}`)
        .join("+");
      parts.push(`collections-${names}`);
    }
    if (selectedExperience.length) {
      parts.push(`exp-${selectedExperience.join("+")}`);
    }
    if (titleFilter.trim()) {
      parts.push(`q-${titleFilter.trim()}`);
    }
    if (bookmarked) {
      parts.push("bookmarked");
    }

    const raw = parts.length ? parts.join("__") : "all";
    return raw
      .toLowerCase()
      .replace(/[^a-z0-9+_\-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^[-_]+|[-_]+$/g, "");
  }

  const totalPages =
    totalJobs > 0 ? Math.ceil(totalJobs / pageSize) : 1;
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages || totalJobs === 0;

  const goToPage = (nextPage: number) => {
    const safePage = Math.min(Math.max(1, nextPage), totalPages || 1);
    if (safePage !== page) {
      setPage(safePage);
      setLastClickedJobId(null);
      setSelectedJob(null);
    }
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newSize = Number(event.target.value);
    if (!Number.isNaN(newSize) && newSize > 0) {
      setPageSize(newSize);
      setPage(1);
    }
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
    setFilters(nextFilters);
    setLastFilterSlug(
      buildFilterSlug(
        nextFilters.jobType,
        nextFilters.fixedPriceRange,
        nextFilters.hourlyRateRange,
        nextFilters.selectedSkills,
        nextFilters.selectedInstruments,
        nextFilters.selectedStatuses,
        nextFilters.selectedCollectionIds,
        nextFilters.selectedExperience,
        nextFilters.titleFilter,
        nextFilters.bookmarked,
        collectionNameById,
      ),
    );
    setPage(1);
  };

  useEffect(() => {
    setLastFilterSlug(
      buildFilterSlug(
        activeFilters.jobType,
        activeFilters.fixedPriceRange,
        activeFilters.hourlyRateRange,
        activeFilters.selectedSkills,
        activeFilters.selectedInstruments,
        activeFilters.selectedStatuses,
        activeFilters.selectedCollectionIds,
        activeFilters.selectedExperience,
        activeFilters.titleFilter,
        activeFilters.bookmarked,
        collectionNameById,
      ),
    );
    setPage(1);
  }, [activeFilters, collectionNameById]);

  const handleCopy = () => {
    const jsonString = JSON.stringify(filteredJobsData, null, 2);
    navigator.clipboard
      .writeText(jsonString)
      .then(() => {
        alert("Jobs copied to clipboard!");
      })
      .catch((err) => {
        console.error("Error while exporting", err);
        alert("Could not copy jobs to clipboard");
      });
  };

  const handleDownload = () => {
    const jsonString = JSON.stringify(filteredJobsData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    const formattedDateTime = `${date}-${time}`
      .replace(/\//g, "-")
      .replace(/:/g, "-");
    a.href = url;
    const filterDescriptor = lastFilterSlug || "all";
    a.download = `filtered-jobs-${filterDescriptor}-${formattedDateTime}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageLoadingBar loading={loading} />
      <FiltersLauncher
        activeFilters={activeFilters}
        onFilterChange={onFilterChanged}
        availableSkills={availableSkills}
        availableInstruments={availableInstruments}
        availableStatuses={availableStatuses}
        availableCollections={collections}
        collectionNameById={collectionNameById}
      />

      <div className="flex flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-medium text-gray-800">
            Showing {filteredJobsData.length} of {totalJobs || filteredJobsData.length} job
            {filteredJobsData.length !== 1 ? "s" : ""}
          </p>
          {/* <p className="text-sm text-gray-600">
            Page {page} of {totalPages} {totalJobs ? `(total ${totalJobs})` : ""}
          </p> */}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-gray-700">
            Page size
          </label>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500 focus:border-blue-500"
            value={pageSize}
            onChange={handlePageSizeChange}
            disabled={loading}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => goToPage(page - 1)}
              disabled={isFirstPage || loading}
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} / {totalPages}
            </span>
            <button
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => goToPage(page + 1)}
              disabled={isLastPage || loading}
            >
              Next
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              className="p-2 rounded text-gray-500 hover:bg-gray-100 disabled:text-gray-200 disabled:bg-white"
              title="Copy jobs to clipboard"
              onClick={handleCopy}
              disabled={filteredJobsData.length === 0}
            >
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6"
                />
              </svg>
            </button>
            <button
              className="p-2 rounded text-gray-500 hover:bg-gray-100 disabled:text-gray-200 disabled:bg-white"
              title="Export jobs as JSON file"
              onClick={handleDownload}
              disabled={filteredJobsData.length === 0}
            >
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6 pt-4">
        {filteredJobsData.map((job) => (
          <JobListItem 
            key={job.id} 
            job={job} 
            onClick={openJobDetails} 
            onJobUpdate={updateJob}
            isLastClicked={lastClickedJobId === job.id}
            collectionNameById={collectionNameById}
            availableCollections={collections}
          />
        ))}
        {selectedJob && (
            // TODO: implement buttons to go to next/previous job in the filtered list
          <JobDetails
            job={selectedJob}
            isOpen={true}
            onClose={closeJobDetails}
            onJobUpdate={updateJob}
            collectionNameById={collectionNameById}
            availableCollections={collections}
          />
        )}
      </div>
    </>
  );
};

export default JobList;
