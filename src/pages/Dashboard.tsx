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
  CountryJobsChart,
  AverageRateByCountryChart,
  JobsByBinnedRangeChart,
  JobsByRateDistributionChart,
  JobsByAverageRateChart,
  JobsByFixedPriceChart,
  HourlyRateChart,
  ClientRatingVsAverageRateChart,
  ClientSpendingByIndustryChart,
  SkillsAverageRateChart,
  SkillsStackedBarChart,
  SkillsBubbleChart,
  SkillsPieChart,
  SkillsTreeMapChart,
  JobsByExperienceLevel,
} from "../components";
import CategoriesDistributionChart from '../features/analytics/charts/CategoriesDistributionChart';
import BudgetHistogramChart from '../features/analytics/charts/BudgetHistogramChart';
import TopSkillsChart from '../features/analytics/charts/TopSkillsChart';
import TrendingKeywordsChart from '../features/analytics/charts/TrendingKeywordsChart';
import { filterJobs, JobType } from "../features";
import StatsPanel from "../features/analytics/components/StatsPanel";
import DashboardFiltersPanel from "../features/analytics/components/DashboardFiltersPanel";
import JobsByCountryChart from "../features/analytics/charts/JobsByCountryChart";
import AverageRateByExperienceLevelChart from '../features/analytics/charts/AverageRateByExperienceLevelChart';
import CompetitionThresholdChart from '../features/analytics/charts/CompetitionThresholdChart';
import PostTimeHeatmapChart from "../features/analytics/charts/PostTimeHeatmapChart";
import ConversionSnapshotChart from "../features/analytics/charts/ConversionSnapshotChart";
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
    minClientRating: number | null,
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
      minClientRating,
    );
    setFilteredJobsData(jobs);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        <DashboardFiltersPanel
          onFilterChange={onFilterChanged}
          availableSkills={availableSkills}
          availableInstruments={availableInstruments}
          availableStatuses={availableStatuses}
        />
      </div>
      <div className="mx-auto p-6 flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="max-w-md min-w-80">
            <CategoriesDistributionChart jobs={filteredJobsData} />
          </div>
          <div className="max-w-md min-w-80">
            <BudgetHistogramChart jobs={filteredJobsData} />
          </div>
        </div>
        <StatsPanel jobs={filteredJobsData} />
        <div className="flex gap-4">
          <div className="max-w-md min-w-80">
            <PostTimeHeatmapChart jobs={filteredJobsData} />
          </div>
          <div className="max-w-md min-w-80">
            <ConversionSnapshotChart jobs={filteredJobsData} />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="max-w-96 min-w-80">
            <TrendingKeywordsChart jobs={filteredJobsData} limit={5} />
          </div>
          <div className="max-w-96 min-w-80">
            <TopSkillsChart jobs={filteredJobsData} limit={5} />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="max-w-md min-w-80">
            <AverageRateByCountry jobs={filteredJobsData} />
          </div>
          <div className="max-w-md min-w-80">
            <JobsByCountryChart jobs={filteredJobsData} />
          </div>
          <div className="flex flex-col gap-4 max-w-xs">
            <AverageRateByExperience jobs={filteredJobsData} />
            <JobsByExperienceLevel jobs={filteredJobsData} />
          </div>
        </div>
        <JobsByBinnedRangeChart jobs={filteredJobsData} rangeStep={15} />
        <JobsByRateDistributionChart jobs={filteredJobsData} valueStep={1} />
        <JobsByAverageRateChart jobs={filteredJobsData} />
        <JobsByFixedPriceChart jobs={filteredJobsData} />
        <ClientRatingVsAverageRateChart jobs={filteredJobsData} />
        <ClientSpendingByIndustryChart jobs={filteredJobsData} />
        <CompetitionThresholdChart jobs={filteredJobsData} />
        <AverageRateByExperienceLevelChart jobs={filteredJobsData} />
        <SkillsAverageRateChart jobs={filteredJobsData} />
        <SkillsStackedBarChart jobs={filteredJobsData} />
        <SkillsBubbleChart jobs={filteredJobsData} />
      </div>
    </DndProvider>
  );
};

export default Dashboard;
