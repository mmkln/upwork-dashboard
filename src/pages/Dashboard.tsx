import React, { useEffect, useState } from "react";
import update from "immutability-helper";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend"; // Бекенд для drag-and-drop
import { fetchUpworkJobs } from "../services";
import { UpworkJob } from "../models";
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
} from "../components";
import Tile from "../components/Tile";
import SkillBadges from "../components/SkillBadges";

const Dashboard: React.FC = () => {
  const [jobsData, setJobsData] = useState<UpworkJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobs = await fetchUpworkJobs();
        setJobsData(jobs);
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

  if (loading) {
    return <p>Loading...</p>;
  }

  const today = new Date();

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="mx-auto p-6 flex flex-col gap-4">
        <div className="flex gap-4">
          <div className=" max-w-3xl">
            <JobStats jobs={jobsData} />
          </div>
          <div className="">
            <JobCalendar jobs={jobsData} month={today} />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="max-w-md min-w-80">
            <AverageRateByCountry jobs={jobsData} />
          </div>
          <div className="max-w-md min-w-80">
            <JobsByCountry jobs={jobsData} />
          </div>
          <div className="flex flex-col gap-4 max-w-xs">
            <AverageRateByExperience jobs={jobsData} />
            <JobsByExperienceLevel jobs={jobsData} />
          </div>
          {/*<div className="max-w-md min-w-80">*/}
          {/*  <TopSkills jobs={jobsData} limit={7} />*/}
          {/*</div>*/}
          <div className="max-w-96 min-w-80">
            <SkillBadges jobs={jobsData} limit={33} />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="max-w-96 min-w-80">
            <KeywordFrequency jobs={jobsData} limit={50} />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="max-w-md min-w-80">
            <AvgMinMaxJobRatesByCountry jobs={jobsData} />
          </div>
          <div className="max-w-md min-w-80">
            <JobRatesByCountryMinMax jobs={jobsData} />
          </div>
          {/*<div className="max-w-md min-w-80">*/}
          {/*  <JobRatesByCountryAvg jobs={jobsData} />*/}
          {/*</div>*/}
          <div className="max-w-md min-w-80">
            <JobRatesByCountryAvg2 jobs={jobsData} />
          </div>
          <div className="max-w-md min-w-80">
            <JobRatesByCountryMed jobs={jobsData} />
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
        <JobsByBinnedRangeChart jobs={jobsData} rangeStep={15} />
        <JobsByRateDistributionChart jobs={jobsData} valueStep={1} />
        <JobsByAverageRateChart jobs={jobsData} />
        <JobsByFixedPriceChart jobs={jobsData} />
        {/*<HourlyRateChart jobs={jobsData} />*/}
        <ClientRatingVsAverageRateChart jobs={jobsData} />
        <ClientSpendingByIndustryChart jobs={jobsData} />
        <JobsOverTimeChart jobs={jobsData} />
        <SkillsAverageRateChart jobs={jobsData} />
        <SkillsStackedBarChart jobs={jobsData} />
        <SkillsBubbleChart jobs={jobsData} />
        {/*<SkillsPieChart jobs={jobsData} />*/}
        {/*<SkillsTreeMapChart jobs={jobsData} />*/}
        {/* Додаткові графіки можна додавати тут */}
      </div>
    </DndProvider>
  );
};

export default Dashboard;
