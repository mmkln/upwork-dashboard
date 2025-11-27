import React, { useEffect, useMemo, useState } from "react";
import update from "immutability-helper";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend"; // Бекенд для drag-and-drop
import { fetchAllUpworkJobs, fetchUpworkJobs } from "../services";
import { JobExperience, JobStatus, PreparedUpworkJob } from "../models";
import {
  AverageRateByCountry,
  AverageRateByExperience,
  JobStats,
  TopSkillsChart,
  ExperiencePieChart,
  CountryJobsChart,
  AverageRateByCountryChart,
  JobsByBinnedRangeChart,
  JobsByRateDistributionChart,
  JobsByAverageRateChart,
  JobsByFixedPriceChart,
  HourlyRateChart,
  ClientRatingVsAverageRateChart,
  ClientSpendingByIndustryChart,
  JobsOverTimeChart,
  SkillsAverageRateChart,
  SkillsStackedBarChart,
  SkillsBubbleChart,
  SkillsPieChart,
  SkillsTreeMapChart,
  JobsByExperienceLevel,
  TopSkills,
  AvgMinMaxJobRatesByCountry,
  JobRatesByCountryMinMax,
  JobRatesByCountryAvg,
  JobRatesByCountryAvg2,
  JobRatesByCountryMed,
  JobCalendar,
  JobsByCountry,
  KeywordFrequency,
  SkillBadges,
  Tile,
  PaymentTypeChart,
  InstrumentBadges,
  TopInstrumentsByAverageRate,
  JobsByIndustryChart,
  JobExportActions,
} from "../components";
import {
  filterJobs,
  JobType,
  FiltersLauncher,
  useFilters,
  useCollections,
} from "../features";
import type { CategoryValueItem } from "../components/charts";
import { instruments, prepareJobs } from "../utils";
import { buildFilterSlug } from "../features/filters/utils/filterSlug.util";

const MIN_TOOL_OCCURRENCES_PERCENTAGE = 0.02;
const MIN_TOOL_OCCURRENCES_ABSOLUTE = 2;
const DASHBOARD_PAGE_SIZE = 2000;

const mapFiltersToQuery = (filters: ReturnType<typeof useFilters>["filters"]) => {
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

const Dashboard: React.FC = () => {
  const [jobsData, setJobsData] = useState<PreparedUpworkJob[]>([]);
  const [filteredJobsData, setFilteredJobsData] =
    useState<PreparedUpworkJob[]>([]);
  const { filters: activeFilters, setFilters } = useFilters();
  const { collections, refreshCollections } = useCollections();
  const [filterSlug, setFilterSlug] = useState<string>("all");

  const availableStatuses = useMemo(
    () => Object.values(JobStatus),
    [],
  );

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
    let cancelled = false;
    const loadJobs = async () => {
      try {
        const allJobs: PreparedUpworkJob[] = [];
        let page = 1;
        const queryParams = {
          page,
          page_size: DASHBOARD_PAGE_SIZE,
          ...mapFiltersToQuery(activeFilters),
        };
        while (true) {
          const pageResult = await fetchUpworkJobs({
            ...queryParams,
            page,
          });
          if (cancelled) return;
          allJobs.push(...prepareJobs(pageResult.results));
          if (!pageResult.next) break;
          page += 1;
        }
        if (cancelled) return;
        setJobsData(allJobs);
        setFilteredJobsData(
          filterJobs(
            allJobs,
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
          ),
        );
        refreshCollections();
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching jobs:", error);
        }
      }
    };
    loadJobs();
    return () => {
      cancelled = true;
    };
  }, [activeFilters, refreshCollections]);

  useEffect(() => {
    setFilteredJobsData(
      filterJobs(
        jobsData,
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
      ),
    );
    setFilterSlug(buildFilterSlug(activeFilters, collectionNameById));
  }, [activeFilters, jobsData, collectionNameById]);

  const [tiles, setTiles] = useState([
    { id: "1", component: <AverageRateByCountry jobs={jobsData} /> },
    { id: "2", component: <AverageRateByExperience jobs={jobsData} /> },
  ]);

  const moveTile = (dragIndex: number, hoverIndex: number) => {
    const draggedTile = tiles[dragIndex];
    setTiles(
      update(tiles, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, draggedTile],
        ],
      }),
    );
  };

  const availableSkills = useMemo(
    () =>
      Array.from(
        new Set(jobsData.flatMap((job) => job.skills)),
      ),
    [jobsData],
  );

  const instrumentAverageRates = useMemo<CategoryValueItem[]>(() => {
    if (!filteredJobsData.length) {
      return [];
    }

    const minOccurrences = Math.max(
      MIN_TOOL_OCCURRENCES_ABSOLUTE,
      Math.floor(filteredJobsData.length * MIN_TOOL_OCCURRENCES_PERCENTAGE),
    );

    const accumulator: Record<
      string,
      {
        totalRate: number;
        withRateCount: number;
        totalCount: number;
      }
    > = {};

    filteredJobsData.forEach((job) => {
      if (job.matchedInstruments.size === 0) {
        return;
      }

      job.matchedInstruments.forEach((instrument) => {
        if (!accumulator[instrument]) {
          accumulator[instrument] = {
            totalRate: 0,
            withRateCount: 0,
            totalCount: 0,
          };
        }

        const bucket = accumulator[instrument];
        bucket.totalCount += 1;

        if (job.hourlyRateAverage != null) {
          bucket.totalRate += job.hourlyRateAverage;
          bucket.withRateCount += 1;
        }
      });
    });

    return Object.entries(accumulator)
      .filter(
        ([, { totalCount, withRateCount }]) =>
          totalCount >= minOccurrences && withRateCount > 0,
      )
      .map(([label, { totalRate, withRateCount, totalCount }]) => ({
        label,
        value:
          withRateCount > 0
            ? Number((totalRate / withRateCount).toFixed(2))
            : 0,
        count: totalCount,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredJobsData]);

  const today = new Date();

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
    const nextFilters = {
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
    const jobs = filterJobs(
      jobsData,
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
    );
    setFilteredJobsData(jobs);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <FiltersLauncher
        activeFilters={activeFilters}
        onFilterChange={onFilterChanged}
        availableSkills={availableSkills}
        availableInstruments={availableInstruments}
        availableStatuses={availableStatuses}
        availableCollections={collections}
        collectionNameById={collectionNameById}
      />
      <div className="flex justify-end px-6 pb-4">
        <JobExportActions
          jobs={filteredJobsData}
          filterDescriptor={filterSlug}
          filenamePrefix="dashboard-jobs"
        />
      </div>
      <div className="mx-auto p-6 flex flex-col gap-4">
        <div className="flex gap-4">
          <div className=" max-w-3xl">
            <JobStats jobs={filteredJobsData} />
          </div>
          <div className="">
            <JobCalendar jobs={filteredJobsData} month={today} />
          </div>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="max-w-96 min-w-80">
            <KeywordFrequency jobs={filteredJobsData} limit={50} />
          </div>
          <div className="max-w-96 min-w-80">
            <KeywordFrequency
              jobs={filteredJobsData}
              limit={50}
              getText={(job) => job.title}
              headingFormatter={(count) => `Top ${count} Job Title Keywords`}
              copyName="Job Title Keywords"
            />
          </div>
          <div className="max-w-96 min-w-80">
            <InstrumentBadges jobs={filteredJobsData} limit={50} />
          </div>
          <div className="max-w-96 min-w-80">
            <SkillBadges jobs={filteredJobsData} limit={50} />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="max-w-md min-w-80">
            <AverageRateByCountry jobs={filteredJobsData} />
          </div>
          <div className="max-w-md min-w-80">
            <JobsByCountry jobs={filteredJobsData} />
          </div>
          <div className="flex flex-col gap-4 max-w-xs">
            <AverageRateByExperience jobs={filteredJobsData} />
            <JobsByExperienceLevel jobs={filteredJobsData} />
          </div>
          {/*<div className="max-w-md min-w-80">*/}
          {/*  <TopSkills jobs={jobsData} limit={7} />*/}
          {/*</div>*/}
        </div>
        <div className="flex gap-4">
          <div className="max-w-96 min-w-80">
            <PaymentTypeChart jobs={filteredJobsData} />
          </div>
          <div className="max-w-md min-w-80">
            <TopInstrumentsByAverageRate
              data={instrumentAverageRates}
              limit={15}
            />
          </div>
          <div className="max-w-md min-w-80">
            <JobsByIndustryChart jobs={filteredJobsData} limit={20} />
          </div>
        </div>
        // TODO: fix or remove these charts
        {/*<div className="flex gap-4">*/}
        {/*  <div className="max-w-md min-w-80">*/}
        {/*    <AvgMinMaxJobRatesByCountry jobs={filteredJobsData} />*/}
        {/*  </div>*/}
        {/*  <div className="max-w-md min-w-80">*/}
        {/*    <JobRatesByCountryMinMax jobs={filteredJobsData} />*/}
        {/*  </div>*/}
        {/*  /!*<div className="max-w-md min-w-80">*!/*/}
        {/*  /!*  <JobRatesByCountryAvg jobs={jobsData} />*!/*/}
        {/*  /!*</div>*!/*/}
        {/*  <div className="max-w-md min-w-80">*/}
        {/*    <JobRatesByCountryAvg2 jobs={filteredJobsData} />*/}
        {/*  </div>*/}
        {/*  <div className="max-w-md min-w-80">*/}
        {/*    <JobRatesByCountryMed jobs={filteredJobsData} />*/}
        {/*  </div>*/}
        {/*</div>*/}

        {/*<div>*/}
        {/*  {tiles.map((tile, index) => (*/}
        {/*    <Tile key={tile.id} id={tile.id} index={index} moveTile={moveTile}>*/}
        {/*      {tile.component}*/}
        {/*    </Tile>*/}
        {/*  ))}*/}
        {/*</div>*/}

        {/*<TopSkillsChart jobs={jobsData} />*/}
        {/*<ExperiencePieChart jobs={jobsData} />*/}
        {/*<CountryJobsChart jobs={jobsData} />*/}
        {/*<AverageRateByCountryChart jobs={jobsData} />*/}
        <JobsByBinnedRangeChart jobs={filteredJobsData} rangeStep={15} />
        <JobsByRateDistributionChart jobs={filteredJobsData} valueStep={1} />
        <JobsByAverageRateChart jobs={filteredJobsData} />
        <JobsByFixedPriceChart jobs={filteredJobsData} />
        {/*<HourlyRateChart jobs={jobsData} />*/}
        <ClientRatingVsAverageRateChart jobs={filteredJobsData} />
        <ClientSpendingByIndustryChart jobs={filteredJobsData} />
        <JobsOverTimeChart jobs={filteredJobsData} />
        {/* TODO: fix calculation in SkillsAverageRateChart*/}
        <SkillsAverageRateChart jobs={filteredJobsData} />
        {/* TODO: implement chart Skills by total spent*/}
        {/* TODO: implement chart Instruments by Average Rate*/}
        <SkillsStackedBarChart jobs={filteredJobsData} />
        <SkillsBubbleChart jobs={filteredJobsData} />
        {/*<SkillsPieChart jobs={jobsData} />*/}
        {/*<SkillsTreeMapChart jobs={jobsData} />*/}
        {/* Додаткові графіки можна додавати тут */}
      </div>
    </DndProvider>
  );
};

export default Dashboard;
