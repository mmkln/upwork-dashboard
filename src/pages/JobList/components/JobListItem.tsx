import React, { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  CheckIcon,
  ChevronsUpDown,
  Clock3,
  Plus,
  X,
} from "lucide-react";
import { UpworkJob, JobStatus } from "../../../models";
import { updateUpworkJob } from "../../../services";
import { JobStatusSelect } from "../../../components";
import {
  Badge,
  Button,
  Card,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../shared/ui";
import { cn } from "lib/utils";

interface JobListItemProps {
  job: UpworkJob;
  onClick: (job: UpworkJob) => void;
  onJobUpdate: (job: UpworkJob) => void;
  isLastClicked?: boolean;
  collectionNameById: Record<number, string>;
  availableCollections: { id: number; name: string }[];
}

type CollectionOption = {
  value: number;
  label: string;
};

const formatPostedTime = (dateString: string) => {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const getPriceInfo = (job: UpworkJob) => {
  if (job.hourly_rates && job.hourly_rates.length > 0) {
    const [minRate, maxRate] = job.hourly_rates;
    const minValue = Number(minRate);
    const maxValue = Number(maxRate);

    if (Number.isNaN(minValue)) {
      return { price: "-", type: "" };
    }

    return {
      price:
        maxRate && !Number.isNaN(maxValue)
          ? `$${minValue.toFixed(0)}-${maxValue.toFixed(0)}`
          : `$${minValue.toFixed(0)}`,
      type: "/ hr",
    };
  }

  if (job.fixed_price != null) {
    const value = Number(job.fixed_price);
    return {
      price: Number.isNaN(value) ? "-" : `$${value.toFixed(0)}`,
      type: "fixed",
    };
  }

  return { price: "-", type: "" };
};

const CollectionPicker: React.FC<{
  options: CollectionOption[];
  value: number[];
  disabled: boolean;
  onChange: (value: number[]) => void;
  onApply: (event: React.MouseEvent) => void;
}> = ({ options, value, disabled, onChange, onApply }) => {
  const [open, setOpen] = useState(false);
  const selectedNames = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);

  const toggleValue = (nextValue: number) => {
    if (value.includes(nextValue)) {
      onChange(value.filter((currentValue) => currentValue !== nextValue));
      return;
    }

    onChange([...value, nextValue]);
  };

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            disabled={disabled || options.length === 0}
            className="h-8 min-w-0 flex-1 justify-between rounded-[10px] border-transparent bg-[#FAFAFC] px-2 text-left text-[11px] font-normal text-[#575757] shadow-none hover:bg-[#F6F8FF]"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="truncate">
              {selectedNames.length ? selectedNames.join(", ") : "Add collection"}
            </span>
            <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[280px] p-0"
          onClick={(event) => event.stopPropagation()}
        >
          <Command>
            <CommandInput placeholder="Search collections..." />
            <CommandList>
              <CommandEmpty>No collections found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const selected = value.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => toggleValue(option.value)}
                    >
                      <span
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <CheckIcon className="h-3 w-3" />
                      </span>
                      <span className="truncate">{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Button
        type="button"
        asChild={false}
        disabled={disabled || value.length === 0}
        size="sm"
        className="h-8 w-8 shrink-0 px-0 py-0 shadow-none"
        title="Add selected collections"
        onClick={onApply}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};

const JobListItem: React.FC<JobListItemProps> = ({
  job,
  onClick,
  onJobUpdate,
  isLastClicked = false,
  collectionNameById,
  availableCollections,
}) => {
  const [jobData, setJobData] = useState<UpworkJob>(job);
  const [selectedCollectionsToAdd, setSelectedCollectionsToAdd] = useState<
    number[]
  >([]);
  const [isUpdatingCollections, setIsUpdatingCollections] = useState(false);

  const availableOptions = useMemo(
    () =>
      availableCollections
        .filter(
          (collection) =>
            !(jobData.collections ?? job.collections ?? []).includes(
              collection.id,
            ),
        )
        .map((collection) => ({
          value: collection.id,
          label: collection.name,
        })),
    [availableCollections, job.collections, jobData.collections],
  );

  useEffect(() => {
    setJobData(job);
    setSelectedCollectionsToAdd([]);
  }, [job]);

  const collectionBadges = (jobData.collections ?? job.collections ?? [])
    .map((collectionId) => ({
      id: collectionId,
      name: collectionNameById[collectionId],
    }))
    .filter((entry): entry is { id: number; name: string } =>
      Boolean(entry.name),
    );

  const handleStatusChange = (status: JobStatus) => {
    updateUpworkJob({ ...jobData, status })
      .then((updatedJob) => {
        setJobData(updatedJob);
        onJobUpdate(updatedJob);
      })
      .catch((error) => {
        console.error("Error updating job status:", error);
      });
  };

  const handleBookmark = () => {
    updateUpworkJob({ ...jobData, is_bookmarked: !jobData.is_bookmarked })
      .then((updatedJob) => {
        setJobData(updatedJob);
        onJobUpdate(updatedJob);
      })
      .catch((error) => {
        console.error("Error updating job bookmark:", error);
      });
  };

  const updateCollections = (collectionIds: number[]) => {
    setIsUpdatingCollections(true);
    const previous = jobData.collections ?? job.collections ?? [];
    setJobData({ ...jobData, collections: collectionIds });
    onJobUpdate({ ...jobData, collections: collectionIds });
    updateUpworkJob({ ...jobData, collections: collectionIds })
      .then((updatedJob) => {
        setJobData(updatedJob);
        onJobUpdate(updatedJob);
      })
      .catch((error) => {
        console.error("Error updating job collections:", error);
        setJobData({ ...jobData, collections: previous });
        onJobUpdate({ ...jobData, collections: previous });
      })
      .finally(() => setIsUpdatingCollections(false));
  };

  const handleRemoveCollection = (
    collectionId: number,
    event?: React.MouseEvent,
  ) => {
    event?.stopPropagation();
    const current = jobData.collections ?? job.collections ?? [];
    updateCollections(current.filter((id) => id !== collectionId));
  };

  const handleAddCollection = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!selectedCollectionsToAdd.length) return;
    const current = jobData.collections ?? job.collections ?? [];
    const merged = Array.from(
      new Set([...current, ...selectedCollectionsToAdd]),
    );
    updateCollections(merged);
    setSelectedCollectionsToAdd([]);
  };

  const priceInfo = getPriceInfo(job);
  const visibleSkills = job.skills.slice(0, 6);
  const hiddenSkillCount = Math.max(0, job.skills.length - visibleSkills.length);

  return (
    <Card
      className={cn(
        "h-full overflow-hidden p-0 transition-shadow duration-200 hover:shadow-lg",
        isLastClicked && "ring-4 ring-tertiary-300",
      )}
    >
      <article
        className="group flex h-full cursor-pointer flex-col gap-6 p-6 transition-colors hover:bg-[#FCFDFF]"
        onClick={() => onClick(job)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-[11px] text-[#8A8A8A]">
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-3.5 w-3.5" />
              {formatPostedTime(job.created_at)}
            </span>
            {job.connects && (
              <span className="rounded-full bg-[#FAFAFC] px-2 py-0.5">
                {parseInt(job.connects)} connects
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="rounded-full bg-[#F6F8FF] px-2 py-1 text-right">
              <span className="text-[11px] font-semibold text-primary-900">
                {priceInfo.price}
              </span>
              {priceInfo.type && (
                <span className="ml-1 text-[10px] font-normal text-[#8A8A8A]">
                  {priceInfo.type}
                </span>
              )}
            </div>
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "transition-all",
                jobData.is_bookmarked
                  ? "opacity-100 text-[#1823F0]"
                  : "opacity-0 group-hover:opacity-100",
              )}
              title={
                jobData.is_bookmarked
                  ? "Remove from bookmarks"
                  : "Bookmark job"
              }
              onClick={(event) => {
                event.stopPropagation();
                handleBookmark();
              }}
            >
              <Bookmark
                className={cn(
                  "h-4 w-4",
                  jobData.is_bookmarked && "fill-current",
                )}
              />
            </IconButton>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <div className="space-y-2">
            <h3 className="line-clamp-2 min-h-[40px] break-words text-[14px] font-semibold leading-5 text-primary-900">
              {job.title}
            </h3>
            <p className="line-clamp-3 text-[11px] font-normal leading-5 text-[#575757]">
              {job.description || "No description provided."}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {visibleSkills.length > 0 ? (
              <>
                {visibleSkills.map((skill) => (
                  <Badge
                    key={skill}
                    tone="info"
                    className="text-[10px] text-secondary-900"
                  >
                    {skill}
                  </Badge>
                ))}
                {hiddenSkillCount > 0 && (
                  <Badge
                    tone="neutral"
                    className="text-[10px] text-[#8A8A8A]"
                  >
                    +{hiddenSkillCount}
                  </Badge>
                )}
              </>
            ) : (
              <span className="rounded-lg bg-[#FAFAFC] px-2 py-1 text-[10px] text-[#8A8A8A]">
                No skills listed
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-4 border-t border-[#F1F2F6] pt-4">
          <div
            className="flex flex-wrap items-center gap-1.5"
            onClick={(event) => event.stopPropagation()}
          >
            {collectionBadges.length > 0 ? (
              collectionBadges.map(({ id, name }) => (
                <Badge
                  key={id}
                  tone="neutral"
                  className="gap-2 text-[10px] text-[#575757]"
                >
                  <span className="max-w-[120px] truncate">{name}</span>
                  <IconButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 rounded-full text-[#8A8A8A] hover:bg-white hover:text-[#141414]"
                    title="Remove from collection"
                    aria-label="Remove from collection"
                    onClick={(event) => handleRemoveCollection(id, event)}
                  >
                    <X className="h-3 w-3" />
                  </IconButton>
                </Badge>
              ))
            ) : (
              <span className="text-[10px] text-[#8A8A8A]">No collections</span>
            )}
          </div>

          <div
            className="flex flex-col gap-2"
            onClick={(event) => event.stopPropagation()}
          >
            {availableCollections.length > 0 && (
              <CollectionPicker
                options={availableOptions}
                value={selectedCollectionsToAdd}
                disabled={isUpdatingCollections}
                onChange={setSelectedCollectionsToAdd}
                onApply={handleAddCollection}
              />
            )}
            <div className="flex justify-end">
              <JobStatusSelect
                status={jobData.status}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>
        </div>
      </article>
    </Card>
  );
};

export default JobListItem;
