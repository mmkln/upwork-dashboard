import React, { useEffect, useMemo, useState } from "react";
import update from "immutability-helper";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend"; // Бекенд для drag-and-drop
import { fetchUpworkJobs, fetchJobCollections } from "../services";
import { JobExperience, JobStatus, UpworkJob, JobCollection } from "../models";
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
} from "../components";
import { filterJobs, Filters, JobType } from "../features";
import type { CategoryValueItem } from "../components/charts";
import {
  instruments,
  toolRegexMap,
  computeJobRate,
  createSearchableContent,
} from "../utils";

const MIN_TOOL_OCCURRENCES_PERCENTAGE = 0.02;
const TOOL_REGEX_ENTRIES = Object.entries(toolRegexMap);

const Dashboard: React.FC = () => {
  const [jobsData, setJobsData] = useState<UpworkJob[]>([]);
  const [collections, setCollections] = useState<JobCollection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredJobsData, setFilteredJobsData] = useState<UpworkJob[]>([]);

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

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const [jobs, jobCollections] = await Promise.all([
          fetchUpworkJobs(),
          fetchJobCollections().catch((error) => {
            console.warn("Failed to fetch collections", error);
            return [] as JobCollection[];
          }),
        ]);
        setJobsData(jobs);
        setFilteredJobsData(jobs);
        setCollections(jobCollections);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

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

  const jobInstrumentMeta = useMemo(() => {
    return jobsData.reduce<
      Map<string, { rate: number | null; instruments: string[] }>
    >((acc, job) => {
      const rate = computeJobRate(job);

      if (rate == null) {
        acc.set(job.id, { rate: null, instruments: [] });
        return acc;
      }

      const searchableContent = createSearchableContent(job);
      if (!searchableContent) {
        acc.set(job.id, { rate, instruments: [] });
        return acc;
      }

      const instrumentsMatched: string[] = [];
      for (const [tool, regexes] of TOOL_REGEX_ENTRIES) {
        if (regexes.some((regex) => regex.test(searchableContent))) {
          instrumentsMatched.push(tool);
        }
      }

      acc.set(job.id, { rate, instruments: instrumentsMatched });
      return acc;
    }, new Map<string, { rate: number | null; instruments: string[] }>());
  }, [jobsData]);

  const instrumentAverageRates = useMemo<CategoryValueItem[]>(() => {
    if (!filteredJobsData.length) {
      return [];
    }

    const accumulator: Record<
      string,
      {
        totalRate: number;
        count: number;
      }
    > = {};

    filteredJobsData.forEach((job) => {
      const meta = jobInstrumentMeta.get(job.id);
      if (!meta || meta.rate == null || meta.instruments.length === 0) {
        return;
      }

      const rate = meta.rate;
      meta.instruments.forEach((instrument) => {
        if (!accumulator[instrument]) {
          accumulator[instrument] = { totalRate: rate, count: 1 };
        } else {
          accumulator[instrument].totalRate += rate;
          accumulator[instrument].count += 1;
        }
      });
    });

    return Object.entries(accumulator)
      .filter(([, { count }]) => count >= filteredJobsData.length * MIN_TOOL_OCCURRENCES_PERCENTAGE)
      .map<CategoryValueItem>(
        ([label, { totalRate, count }]) => ({
          label,
          value: Number((totalRate / count).toFixed(2)),
          count,
        }),
      )
      .sort((a, b) => b.value - a.value);
  }, [filteredJobsData, jobInstrumentMeta]);

  if (loading) {
    return <p>Loading...</p>;
  }

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
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        <Filters
          onFilterChange={onFilterChanged}
          availableSkills={availableSkills}
          availableInstruments={availableInstruments}
          availableStatuses={availableStatuses}
          availableCollections={collections}
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
        <div className="flex gap-4">
          <div className="max-w-96 min-w-80">
            <KeywordFrequency jobs={filteredJobsData} limit={50} />
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
