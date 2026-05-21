import React, { useEffect, useMemo } from "react";
import { JobExperience, JobStatus } from "../models";
import {
  AverageRateByCountry,
  AverageRateByExperience,
  JobStats,
  JobsByBinnedRangeChart,
  JobsByRateDistributionChart,
  JobsByAverageRateChart,
  JobsByFixedPriceChart,
  ClientRatingVsAverageRateChart,
  ClientSpendingByIndustryChart,
  JobsOverTimeChart,
  SkillsAverageRateChart,
  SkillsStackedBarChart,
  SkillsBubbleChart,
  JobsByExperienceLevel,
  JobCalendar,
  JobsByCountry,
  KeywordFrequency,
  SkillBadges,
  PaymentTypeChart,
  InstrumentBadges,
  TopInstrumentsByAverageRate,
  JobsByIndustryChart,
  JobExportActions,
} from "../components";
import {
  JobType,
  FiltersLauncher,
  useFilters,
  useCollections,
  useDashboardAnalytics,
  useJobFacets,
  JobsSnapshotProgress,
} from "../features";
import { instruments } from "../utils";
import { buildFilterSlug } from "../features/filters/utils/filterSlug.util";
import { Card, PageHeader, PageShell } from "../shared/ui";

const DASHBOARD_PAGE_SIZE = 2000;

type DashboardSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  description,
  children,
}) => (
  <section className="space-y-component">
    <div className="space-y-micro">
      <h2 className="text-heading text-text-primary">{title}</h2>
      {description && (
        <p className="text-body text-text-secondary">{description}</p>
      )}
    </div>
    {children}
  </section>
);

type DashboardMetricProps = {
  label: string;
  value: string;
  detail?: string;
};

const DashboardMetric: React.FC<DashboardMetricProps> = ({
  label,
  value,
  detail,
}) => (
  <Card className="p-card">
    <p className="text-label text-text-muted">{label}</p>
    <p className="mt-item text-data text-text-primary">{value}</p>
    {detail && <p className="mt-micro text-body text-text-secondary">{detail}</p>}
  </Card>
);

const Dashboard: React.FC = () => {
  const { filters: activeFilters, setFilters } = useFilters();
  const { collections, refreshCollections } = useCollections();
  const {
    sourceJobs,
    filteredJobs,
    instrumentAverageRates,
    averageHourlyRate,
    bookmarkedCount,
    countryCount,
    loadedCount,
    totalCount,
    isHydrating,
    isReady,
    error,
  } = useDashboardAnalytics({
    filters: activeFilters,
    pageSize: DASHBOARD_PAGE_SIZE,
  });
  const { facets } = useJobFacets({ pageSize: DASHBOARD_PAGE_SIZE });

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

  const filterSlug = useMemo(
    () => buildFilterSlug(activeFilters, collectionNameById),
    [activeFilters, collectionNameById],
  );

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
  };

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        actions={
          <JobExportActions
            jobs={filteredJobs}
            filterDescriptor={filterSlug}
            filenamePrefix="dashboard-jobs"
          />
        }
      />

      <FiltersLauncher
        activeFilters={activeFilters}
        onFilterChange={onFilterChanged}
        availableSkills={facets.skills}
        availableInstruments={availableInstruments}
        availableStatuses={availableStatuses}
        availableCollections={collections}
        collectionNameById={collectionNameById}
      />

      <JobsSnapshotProgress
        loadedCount={loadedCount}
        totalCount={totalCount}
        isHydrating={isHydrating}
        isReady={isReady}
        error={error}
        label="Loading dashboard data"
      />

      <div className="grid gap-component md:grid-cols-2 xl:grid-cols-4">
        <DashboardMetric
          label="Filtered Jobs"
          value={filteredJobs.length.toLocaleString()}
          detail={`${sourceJobs.length.toLocaleString()} loaded total`}
        />
        <DashboardMetric
          label="Average Hourly Rate"
          value={
            averageHourlyRate == null
              ? "-"
              : `$${averageHourlyRate.toFixed(0)}`
          }
          detail="Across jobs with hourly ranges"
        />
        <DashboardMetric
          label="Countries"
          value={countryCount.toLocaleString()}
          detail="Represented in filtered jobs"
        />
        <DashboardMetric
          label="Bookmarked"
          value={bookmarkedCount.toLocaleString()}
          detail="Saved opportunities"
        />
      </div>

      <DashboardSection
        title="Overview"
        description="High-level job status and posting activity."
      >
        <div className="grid gap-component xl:grid-cols-overview">
          <div className="min-w-0">
            <JobStats jobs={filteredJobs} />
          </div>
          <div className="min-w-0">
            <JobCalendar jobs={filteredJobs} month={today} />
          </div>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Demand Signals"
        description="Keywords, tools, and skills that appear most often."
      >
        <div className="grid gap-component md:grid-cols-2 xl:grid-cols-4">
          <div className="min-w-0">
            <KeywordFrequency jobs={filteredJobs} limit={50} />
          </div>
          <div className="min-w-0">
            <KeywordFrequency
              jobs={filteredJobs}
              limit={50}
              getText={(job) => job.title}
              headingFormatter={(count) => `Top ${count} Job Title Keywords`}
              copyName="Job Title Keywords"
            />
          </div>
          <div className="min-w-0">
            <InstrumentBadges jobs={filteredJobs} limit={50} />
          </div>
          <div className="min-w-0">
            <SkillBadges jobs={filteredJobs} limit={50} />
          </div>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Rates And Segments"
        description="Rate distribution by country, experience, payment type, tools, and industries."
      >
        <div className="grid gap-component lg:grid-cols-2 xl:grid-cols-3">
          <div className="min-w-0">
            <AverageRateByCountry jobs={filteredJobs} />
          </div>
          <div className="min-w-0">
            <JobsByCountry jobs={filteredJobs} />
          </div>
          <div className="min-w-0">
            <AverageRateByExperience jobs={filteredJobs} />
          </div>
          <div className="min-w-0">
            <JobsByExperienceLevel jobs={filteredJobs} />
          </div>
          <div className="min-w-0">
            <PaymentTypeChart jobs={filteredJobs} />
          </div>
          <div className="min-w-0">
            <TopInstrumentsByAverageRate
              data={instrumentAverageRates}
              limit={15}
            />
          </div>
          <div className="min-w-0 xl:col-span-3">
            <JobsByIndustryChart jobs={filteredJobs} limit={20} />
          </div>
        </div>
      </DashboardSection>

      <DashboardSection
        title="Trend Charts"
        description="Detailed historical and distribution charts for deeper analysis."
      >
        <div className="grid gap-component xl:grid-cols-2">
          <JobsByBinnedRangeChart jobs={filteredJobs} rangeStep={15} />
          <JobsByRateDistributionChart jobs={filteredJobs} valueStep={1} />
          <JobsByAverageRateChart jobs={filteredJobs} />
          <JobsByFixedPriceChart jobs={filteredJobs} />
          <ClientRatingVsAverageRateChart jobs={filteredJobs} />
          <ClientSpendingByIndustryChart jobs={filteredJobs} />
          <JobsOverTimeChart jobs={filteredJobs} />
          <SkillsAverageRateChart jobs={filteredJobs} />
          <SkillsStackedBarChart jobs={filteredJobs} />
          <SkillsBubbleChart jobs={filteredJobs} />
        </div>
      </DashboardSection>
    </PageShell>
  );
};

export default Dashboard;
