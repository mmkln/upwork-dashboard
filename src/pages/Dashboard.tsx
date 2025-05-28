import React, { useEffect, useState } from "react";
import update from "immutability-helper";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend"; // Бекенд для drag-and-drop
import { fetchUpworkJobs } from "../services";
import { JobExperience, JobStatus, UpworkJob } from "../models";
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
} from "../components";
import { filterJobs, Filters, JobType } from "../features";
import { instruments } from "../utils";

const Dashboard: React.FC = () => {
  const [jobsData, setJobsData] = useState<UpworkJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredJobsData, setFilteredJobsData] = useState<UpworkJob[]>([]);
  const availableStatuses = Object.values(JobStatus);
  const availableInstruments: string[] = instruments.map((toolEntry) =>
    Array.isArray(toolEntry) ? toolEntry[0] : toolEntry,
  );

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobs = await fetchUpworkJobs();
        setJobsData(jobs);
        setFilteredJobsData(jobs);
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

  const availableSkills = Array.from(
    new Set(jobsData.flatMap((job) => job.skills)),
  );

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
    selectedExperience: JobExperience[],
    titleFilter: string,
  ) => {
    const jobs = filterJobs(
      jobsData,
      jobType,
      fixedPriceRange,
      hourlyRateRange,
      selectedSkills,
      selectedInstruments,
      selectedStatuses,
      selectedExperience,
      titleFilter,
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
            <InstrumentBadges jobs={filteredJobsData} />
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
        </div>
        <div className="flex gap-4">
          <div className="max-w-md min-w-80">
            <AvgMinMaxJobRatesByCountry jobs={filteredJobsData} />
          </div>
          <div className="max-w-md min-w-80">
            <JobRatesByCountryMinMax jobs={filteredJobsData} />
          </div>
          {/*<div className="max-w-md min-w-80">*/}
          {/*  <JobRatesByCountryAvg jobs={jobsData} />*/}
          {/*</div>*/}
          <div className="max-w-md min-w-80">
            <JobRatesByCountryAvg2 jobs={filteredJobsData} />
          </div>
          <div className="max-w-md min-w-80">
            <JobRatesByCountryMed jobs={filteredJobsData} />
          </div>
        </div>

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
        <SkillsAverageRateChart jobs={filteredJobsData} />
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
