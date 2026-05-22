import { useMemo, useState } from "react";
import type { JobCollection } from "../../../models";
import { ArrowTrendingUpIcon } from "../../../shared/icons";
import { Badge, Button, Checkbox, Input, Textarea } from "../../../shared/ui";
import { createMarketResearch, updateMarketResearch } from "../../../services/apiService";

type ResearchStep = "title" | "description" | "jobs" | "refine";
type JobScopeMode = "all" | "collections";
type WorkTypeFilter = "any" | "hourly" | "fixed";
type BudgetFilter = "any" | "with-budget";

type MarketSignalsEmptyStateProps = {
  totalJobsCount: number;
  collections: JobCollection[];
  isLoadingJobs: boolean;
};

const MIN_TITLE_LENGTH = 3;

const getTitleError = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) return "empty";
  if (trimmedValue.length < MIN_TITLE_LENGTH) {
    return "Use at least 3 characters.";
  }
  return "";
};

const MarketSignalsEmptyState: React.FC<MarketSignalsEmptyStateProps> = ({
  totalJobsCount,
  collections,
  isLoadingJobs,
}) => {
  const [step, setStep] = useState<ResearchStep>("title");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [researchId, setResearchId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [jobScopeMode, setJobScopeMode] = useState<JobScopeMode>("all");
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<number[]>(
    [],
  );
  const [scopeTouched, setScopeTouched] = useState(false);
  const trimmedTitle = title.trim();
  const titleError = useMemo(() => getTitleError(title), [title]);
  const showTitleError =
    titleTouched && Boolean(titleError) && titleError !== "empty";
  const isDescriptionStep = step === "description";
  const isJobsStep = step === "jobs";
  const isRefineStep = step === "refine";

  // Calculate selected jobs count without relying on the actual jobs array
  const selectedJobsCount = useMemo(() => {
    if (jobScopeMode === "all") return totalJobsCount;
    return collections
      .filter((c) => selectedCollectionIds.includes(c.id))
      .reduce((sum, c) => sum + (c.job_count || 0), 0);
  }, [jobScopeMode, totalJobsCount, collections, selectedCollectionIds]);

  const scopeError =
    jobScopeMode === "collections" && selectedCollectionIds.length === 0
      ? "Select at least one collection."
      : "";
  const showScopeError = scopeTouched && Boolean(scopeError);

  const handleStart = async () => {
    setTitleTouched(true);
    if (titleError) return;
    
    setIsSaving(true);
    try {
      const response = await createMarketResearch(trimmedTitle);
      setResearchId(response.id);
      setStep("description");
    } catch (error) {
      console.error("Failed to create market research", error);
      // Optional: Add a toast or error state here
    } finally {
      setIsSaving(false);
    }
  };

  const handleDescriptionNext = async () => {
    if (description.trim() && researchId) {
      setIsSaving(true);
      try {
        await updateMarketResearch(researchId, description.trim());
      } catch (error) {
        console.error("Failed to update market research description", error);
      } finally {
        setIsSaving(false);
      }
    }
    setStep("jobs");
  };

  const toggleCollection = (collectionId: number) => {
    setSelectedCollectionIds((current) =>
      current.includes(collectionId)
        ? current.filter((id) => id !== collectionId)
        : [...current, collectionId],
    );
  };

  const handleJobsNext = () => {
    setScopeTouched(true);
    if (scopeError) return;
    setStep("refine");
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto flex w-full max-w-[640px] flex-col items-center text-center">
        <div className="mb-component flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-text-secondary">
          <ArrowTrendingUpIcon className="h-6 w-6" />
        </div>

        <h1 className="text-display text-text-primary">
          {isDescriptionStep || isJobsStep || isRefineStep
            ? trimmedTitle
            : "Find your next market signal"}
        </h1>
        <p className="mt-control text-body text-text-secondary">
          {isRefineStep
            ? "Narrow the selected jobs if needed, then save the final snapshot."
            : isJobsStep
            ? "Choose the jobs this research should inspect. Collections only help make the selection."
            : isDescriptionStep
              ? "Add a short description so this research has a clear purpose."
            : "Name a research pass to start turning job data into repeated buyer patterns and demand signals."}
        </p>

        {isRefineStep ? (
          <div className="mt-card flex w-full flex-col gap-component text-left text-center py-page">
            <p className="text-body text-text-secondary">
              The refine and snapshot creation step will be implemented in the next iteration.
            </p>
            <div className="mt-control flex justify-center gap-item">
              <Button size="sm" variant="ghost" onClick={() => setStep("jobs")}>
                Back
              </Button>
            </div>
          </div>


        ) : isJobsStep ? (
          <div className="mt-card flex w-full flex-col gap-component text-left">
            <div className="grid grid-cols-1 gap-component sm:grid-cols-2">
              <ScopeOption
                active={jobScopeMode === "all"}
                count={totalJobsCount}
                disabled={isLoadingJobs}
                label="All jobs"
                meta="Use every loaded job."
                onClick={() => {
                  setJobScopeMode("all");
                  setScopeTouched(false);
                }}
              />
              <ScopeOption
                active={jobScopeMode === "collections"}
                count={selectedJobsCount}
                disabled={isLoadingJobs || collections.length === 0}
                label="Selected collections"
                meta="Choose one or more collections."
                onClick={() => {
                  setJobScopeMode("collections");
                  setScopeTouched(true);
                }}
              />
            </div>

            {jobScopeMode === "collections" ? (
              <div className="flex max-h-[260px] flex-col gap-item overflow-y-auto rounded-[12px] bg-surface-subtle p-component">
                {collections.length ? (
                  collections.map((collection) => (
                    <label
                      key={collection.id}
                      className="flex cursor-pointer items-center justify-between gap-control rounded-[10px] bg-surface px-control py-control"
                    >
                      <span className="flex min-w-0 items-center gap-control">
                        <Checkbox
                          checked={selectedCollectionIds.includes(
                            collection.id,
                          )}
                          onChange={() => toggleCollection(collection.id)}
                        />
                        <span className="truncate text-ui text-text-primary">
                          {collection.name}
                        </span>
                      </span>
                      <span className="shrink-0 text-body text-text-muted">
                        {(collection.job_count || 0).toLocaleString()} jobs
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-body text-text-muted">
                    No collections available.
                  </p>
                )}
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-control rounded-[12px] bg-surface-subtle px-component py-control">
              <span className="text-body text-text-secondary">
                Jobs selected
              </span>
              <Badge tone="info">
                {selectedJobsCount.toLocaleString()}
              </Badge>
            </div>

            {showScopeError ? (
              <p className="text-body text-warning">{scopeError}</p>
            ) : null}

            <div className="flex justify-end gap-item">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStep("description")}
              >
                Back
              </Button>
              <Button
                disabled={isLoadingJobs || selectedJobsCount === 0}
                size="sm"
                onClick={handleJobsNext}
              >
                Next
              </Button>
            </div>
          </div>
        ) : isDescriptionStep ? (
          <div className="mt-card flex w-full flex-col gap-control">
            <Textarea
              aria-label="Research description"
              className="min-h-[112px] text-left"
              placeholder="What should this research help you understand?"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <div className="flex justify-end gap-item">
              <Button
                disabled={isSaving}
                size="sm"
                variant="ghost"
                onClick={() => setStep("title")}
              >
                Back
              </Button>
              <Button disabled={isSaving} size="sm" onClick={handleDescriptionNext}>
                {isSaving ? "Saving..." : "Next"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-card flex w-full flex-col gap-item">
            <div className="flex flex-col gap-item sm:flex-row">
              <Input
                aria-describedby={showTitleError ? "research-title-error" : undefined}
                aria-invalid={showTitleError}
                aria-label="Research title"
                className="sm:flex-1"
                placeholder="Enter a research title."
                value={title}
                onBlur={() => setTitleTouched(true)}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleStart();
                  }
                }}
              />
              <Button
                className="sm:shrink-0"
                disabled={Boolean(titleError) || isSaving}
                size="sm"
                onClick={handleStart}
              >
                {isSaving ? "Creating..." : "Start new research"}
              </Button>
            </div>
            {showTitleError ? (
              <p
                id="research-title-error"
                className="text-left text-body text-warning"
              >
                {titleError}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

type ScopeOptionProps = {
  active: boolean;
  count: number;
  disabled?: boolean;
  label: string;
  meta: string;
  onClick: () => void;
};

type SelectionMetricProps = {
  label: string;
  value: number;
};

const SelectionMetric: React.FC<SelectionMetricProps> = ({ label, value }) => (
  <div className="rounded-[14px] bg-surface-subtle p-component text-center">
    <p className="text-label text-text-muted">{label}</p>
    <p className="mt-micro text-data text-text-primary">
      {value.toLocaleString()}
    </p>
  </div>
);

type FilterChoiceProps = {
  active: boolean;
  label: string;
  onClick: () => void;
};

const FilterChoice: React.FC<FilterChoiceProps> = ({
  active,
  label,
  onClick,
}) => (
  <button
    type="button"
    className={
      active
        ? "h-10 rounded-[10px] bg-primary px-control text-ui text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        : "h-10 rounded-[10px] bg-surface-subtle px-control text-ui text-text-secondary focus:outline-none focus:ring-2 focus:ring-ring"
    }
    onClick={onClick}
  >
    {label}
  </button>
);

const ScopeOption: React.FC<ScopeOptionProps> = ({
  active,
  count,
  disabled = false,
  label,
  meta,
  onClick,
}) => (
  <button
    type="button"
    disabled={disabled}
    className={
      active
        ? "rounded-[14px] bg-primary p-component text-left text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        : "rounded-[14px] bg-surface-subtle p-component text-left focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
    }
    onClick={onClick}
  >
    <span className="flex items-start justify-between gap-control">
      <span>
        <span
          className={
            active
              ? "block text-ui text-primary-foreground"
              : "block text-ui text-text-primary"
          }
        >
          {label}
        </span>
        <span
          className={
            active
              ? "mt-micro block text-body text-primary-foreground/80"
              : "mt-micro block text-body text-text-secondary"
          }
        >
          {meta}
        </span>
      </span>
      <span
        className={
          active
            ? "rounded-full bg-primary-foreground/15 px-item py-micro text-label text-primary-foreground"
            : "rounded-full bg-surface px-item py-micro text-label text-text-secondary"
        }
      >
        {count.toLocaleString()}
      </span>
    </span>
  </button>
);

export default MarketSignalsEmptyState;
