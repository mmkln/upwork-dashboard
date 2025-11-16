// src/components/JobList.tsx
import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import {
  UpworkJob,
  JobStatus,
  JobExperience,
  JobCollection,
  PreparedUpworkJob,
} from "../../models";
import { fetchUpworkJobs, fetchJobCollections } from "../../services";
import { JobDetails } from "../../components";
import { filterJobs, Filters, JobType } from "../../features";
import { JobListItem } from "./components";
import { instruments, prepareJobs } from "../../utils";

Modal.setAppElement("#root");

const JobList: React.FC = () => {
  const [jobsData, setJobsData] = useState<PreparedUpworkJob[]>([]);
  const [collections, setCollections] = useState<JobCollection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedJob, setSelectedJob] = useState<PreparedUpworkJob | null>(null);
  const [filteredJobsData, setFilteredJobsData] =
    useState<PreparedUpworkJob[]>([]);
  const [lastClickedJobId, setLastClickedJobId] = useState<string | null>(null);
  const [lastFilterSlug, setLastFilterSlug] = useState<string>("all");
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
    const loadJobs = async () => {
      try {
        const [fetchedJobs, fetchedCollections] = await Promise.all([
          fetchUpworkJobs(),
          fetchJobCollections().catch((error) => {
            console.warn("Failed to fetch collections", error);
            return [] as JobCollection[];
          }),
        ]);
        const preparedJobs = prepareJobs(fetchedJobs);
        const sortedJobs = sortJobs(preparedJobs);
        setJobsData(sortedJobs);
        setFilteredJobsData(sortedJobs);
        setCollections(fetchedCollections);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

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

  if (loading) {
    return <p>Loading...</p>;
  }

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
    console.log({ jobType, fixedPriceRange, hourlyRateRange, selectedSkills });
    const jobs = filterJobs(
      jobsData,
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
    );
    setFilteredJobsData(jobs);
    setLastFilterSlug(
      buildFilterSlug(
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
        collectionNameById,
      ),
    );
  };

  const buildFilterSlug = (
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
  ): string => {
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
  };

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
      <div className="p-6">
        <Filters
          onFilterChange={onFilterChanged}
          availableSkills={availableSkills}
          availableInstruments={availableInstruments}
          availableStatuses={availableStatuses}
          availableCollections={collections}
        />
      </div>
      <div className="flex items-center justify-between px-6">
        <p className="text-lg font-medium text-gray-800">
          {filteredJobsData.length} job
          {filteredJobsData.length !== 1 ? "s" : ""} found
        </p>
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
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
          </button>
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
          />
        )}
      </div>
    </>
  );
};

export default JobList;
