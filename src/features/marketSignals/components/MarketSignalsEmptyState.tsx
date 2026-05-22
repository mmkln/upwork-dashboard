import React, { useMemo, useState } from "react";
import {
  createJobsSnapshot,
  createMarketResearch,
  type JobSnapshotFilters,
  type MarketResearch,
} from "../../marketResearch";
import { Badge, Button, Checkbox, Input, Textarea } from "../../../shared/ui";
import { useMarketResearchCreationResources } from "../queries/useMarketResearchCreationResources";

type ResearchStep = "title" | "description" | "scope" | "filters";
type JobScopeMode = "all" | "collections";
type WorkTypeFilter = "any" | "fixed" | "hourly" | "unspecified";
type ExperienceFilter =
  | "any"
  | "Entry level"
  | "Intermediate"
  | "Expert";

type MarketSignalsEmptyStateProps = {
  onCreated: (record: MarketResearch) => void;
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
  onCreated,
}) => {
  const resources = useMarketResearchCreationResources();
  const [step, setStep] = useState<ResearchStep>("title");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [createdResearch, setCreatedResearch] =
    useState<MarketResearch | null>(null);
  const [jobScopeMode, setJobScopeMode] = useState<JobScopeMode>("all");
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<number[]>(
    [],
  );
  const [scopeTouched, setScopeTouched] = useState(false);
  const [search, setSearch] = useState("");
  const [workTypeFilter, setWorkTypeFilter] = useState<WorkTypeFilter>("any");
  const [experienceFilter, setExperienceFilter] =
    useState<ExperienceFilter>("any");
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const titleError = useMemo(() => getTitleError(title), [title]);
  const showTitleError =
    titleTouched && Boolean(titleError) && titleError !== "empty";

  const selectedCollectionsCount = useMemo(
    () =>
      resources.collections
        .filter((collection) => selectedCollectionIds.includes(collection.id))
        .reduce((sum, collection) => sum + (collection.job_count ?? 0), 0),
    [resources.collections, selectedCollectionIds],
  );

  const scopeError =
    jobScopeMode === "collections" && selectedCollectionIds.length === 0
      ? "Select at least one collection."
      : "";
  const showScopeError = scopeTouched && Boolean(scopeError);

  const buildAppliedFilters = (): JobSnapshotFilters => {
    const filters: JobSnapshotFilters = {};
    if (search.trim()) {
      filters.search = search.trim();
    }
    if (jobScopeMode === "collections" && selectedCollectionIds.length) {
      filters.collections = selectedCollectionIds.join(",");
    }
    if (workTypeFilter !== "any") {
      filters.job_type = workTypeFilter;
    }
    if (experienceFilter !== "any") {
      filters.experience = experienceFilter;
    }
    if (bookmarkedOnly) {
      filters.bookmarked = "true";
    }
    return filters;
  };

  const handleStart = () => {
    setTitleTouched(true);
    if (titleError) return;
    setStep("description");
  };

  const handleDescriptionNext = () => {
    setStep("scope");
    setSaveError("");
    void resources.loadCollections();
  };

  const toggleCollection = (collectionId: number) => {
    setSelectedCollectionIds((current) =>
      current.includes(collectionId)
        ? current.filter((id) => id !== collectionId)
        : [...current, collectionId],
    );
  };

  const handleScopeNext = () => {
    setScopeTouched(true);
    if (scopeError || resources.isLoading || resources.error) return;
    setStep("filters");
  };

  const handleCreateResearch = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError("");
    try {
      const research =
        createdResearch ??
        (await createMarketResearch({
          title: trimmedTitle,
          description: trimmedDescription,
        }));
      setCreatedResearch(research);
      await createJobsSnapshot(research.id, {
        applied_filters: buildAppliedFilters(),
      });
      onCreated(research);
    } catch {
      setSaveError("Unable to create market research snapshot.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="mx-auto flex w-full max-w-[640px] flex-col text-left">
        <div className="flex flex-col gap-control text-center">
          <p className="text-heading text-text-primary">
            {step === "title"
              ? "New research"
              : step === "description"
                ? trimmedTitle
                : step === "scope"
                  ? "Choose source"
                  : "Create snapshot"}
          </p>
          <p className="text-body text-text-secondary">
            {step === "filters"
              ? "Backend will freeze matching job IDs from these filters."
              : step === "scope"
                ? "Collections are loaded now so the snapshot uses current backend data."
                : step === "description"
                  ? "Add a short purpose for this research."
                  : "Start by naming the research container."}
          </p>
        </div>

        {step === "filters" ? (
          <div className="mt-card flex w-full flex-col gap-component">
            <label className="flex flex-col gap-item">
              <span className="text-label text-text-muted">Search</span>
              <Input
                value={search}
                placeholder="gohighlevel"
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <div className="flex flex-col gap-item">
              <span className="text-label text-text-muted">Work type</span>
              <div className="grid grid-cols-2 gap-item sm:grid-cols-4">
                <FilterChoice
                  active={workTypeFilter === "any"}
                  label="Any"
                  onClick={() => setWorkTypeFilter("any")}
                />
                <FilterChoice
                  active={workTypeFilter === "fixed"}
                  label="Fixed"
                  onClick={() => setWorkTypeFilter("fixed")}
                />
                <FilterChoice
                  active={workTypeFilter === "hourly"}
                  label="Hourly"
                  onClick={() => setWorkTypeFilter("hourly")}
                />
                <FilterChoice
                  active={workTypeFilter === "unspecified"}
                  label="Unspecified"
                  onClick={() => setWorkTypeFilter("unspecified")}
                />
              </div>
            </div>

            <label className="flex flex-col gap-item">
              <span className="text-label text-text-muted">Experience</span>
              <select
                className="h-target rounded-control border border-control-border bg-control px-component text-ui text-text-primary focus:border-action focus:outline-none focus:ring-2 focus:ring-ring"
                value={experienceFilter}
                onChange={(event) =>
                  setExperienceFilter(event.target.value as ExperienceFilter)
                }
              >
                <option value="any">Any experience</option>
                <option value="Entry level">Entry level</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
            </label>

            <label className="flex items-center gap-control text-ui text-text-primary">
              <Checkbox
                checked={bookmarkedOnly}
                onChange={() => setBookmarkedOnly((value) => !value)}
              />
              Bookmarked only
            </label>

            {jobScopeMode === "collections" ? (
              <div className="flex items-center justify-between gap-control rounded-block bg-block-subtle px-component py-control">
                <span className="text-body text-text-secondary">
                  Collections filter
                </span>
                <Badge tone="info">
                  {selectedCollectionIds.length.toLocaleString()} selected
                </Badge>
              </div>
            ) : null}

            {saveError ? (
              <p className="text-body text-destructive">{saveError}</p>
            ) : null}

            <div className="flex justify-end gap-item">
              <Button size="sm" variant="ghost" onClick={() => setStep("scope")}>
                Back
              </Button>
              <Button disabled={isSaving} size="sm" onClick={handleCreateResearch}>
                {isSaving ? "Creating" : "Create research"}
              </Button>
            </div>
          </div>
        ) : step === "scope" ? (
          <div className="mt-card flex w-full flex-col gap-component">
            {resources.error ? (
              <div className="rounded-block bg-block-subtle p-component">
                <p className="text-body text-destructive">{resources.error}</p>
                <Button
                  className="mt-control"
                  size="sm"
                  variant="soft"
                  onClick={() => {
                    void resources.loadCollections();
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-component sm:grid-cols-2">
              <ScopeOption
                active={jobScopeMode === "all"}
                label="All matching jobs"
                meta="No collection filter."
                onClick={() => {
                  setJobScopeMode("all");
                  setScopeTouched(false);
                }}
              />
              <ScopeOption
                active={jobScopeMode === "collections"}
                disabled={
                  resources.isLoading || resources.collections.length === 0
                }
                label="Selected collections"
                meta={
                  resources.isLoading
                    ? "Loading collections."
                    : `${selectedCollectionsCount.toLocaleString()} listed jobs`
                }
                onClick={() => {
                  setJobScopeMode("collections");
                  setScopeTouched(true);
                }}
              />
            </div>

            {jobScopeMode === "collections" ? (
              <div className="flex max-h-[260px] flex-col gap-item overflow-y-auto rounded-block bg-block-subtle p-component">
                {resources.collections.length ? (
                  resources.collections.map((collection) => (
                    <label
                      key={collection.id}
                      className="flex cursor-pointer items-center justify-between gap-control rounded-control bg-control px-control py-control"
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
                        {(collection.job_count ?? 0).toLocaleString()} jobs
                      </span>
                    </label>
                  ))
                ) : (
                  <p className="text-body text-text-muted">
                    {resources.isLoading
                      ? "Loading collections."
                      : "No collections available."}
                  </p>
                )}
              </div>
            ) : null}

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
                disabled={resources.isLoading || Boolean(resources.error)}
                size="sm"
                onClick={handleScopeNext}
              >
                {resources.isLoading ? "Loading" : "Next"}
              </Button>
            </div>
          </div>
        ) : step === "description" ? (
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
                size="sm"
                variant="ghost"
                onClick={() => setStep("title")}
              >
                Back
              </Button>
              <Button size="sm" onClick={handleDescriptionNext}>
                Next
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-card flex w-full flex-col gap-item">
            <div className="flex flex-col gap-item sm:flex-row">
              <Input
                aria-describedby={
                  showTitleError ? "research-title-error" : undefined
                }
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
                disabled={Boolean(titleError)}
                size="sm"
                onClick={handleStart}
              >
                Start new research
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
  disabled?: boolean;
  label: string;
  meta: string;
  onClick: () => void;
};

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
        ? "h-target rounded-control bg-primary px-control text-ui text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        : "h-target rounded-control bg-control px-control text-ui text-text-secondary focus:outline-none focus:ring-2 focus:ring-ring"
    }
    onClick={onClick}
  >
    {label}
  </button>
);

const ScopeOption: React.FC<ScopeOptionProps> = ({
  active,
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
        ? "rounded-block bg-primary p-component text-left text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
        : "rounded-block bg-block-subtle p-component text-left focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
    }
    onClick={onClick}
  >
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
  </button>
);

export default MarketSignalsEmptyState;
