import React, { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Check,
  CheckIcon,
  ChevronsUpDown,
  Clipboard,
  ExternalLink,
  Link,
  X,
} from "lucide-react";
import { JobStatus, UpworkJob } from "../models";
import { JobStatusSelect } from ".";
import { updateUpworkJob } from "../services";
import {
  Badge,
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../shared/ui";
import { cn } from "lib/utils";

interface JobDetailsProps {
  job: UpworkJob;
  isOpen: boolean;
  onClose: () => void;
  onJobUpdate: (job: UpworkJob) => void;
  collectionNameById: Record<number, string>;
  availableCollections: { id: number; name: string }[];
}

type CollectionOption = {
  value: number;
  label: string;
};

const formatPayment = (job: UpworkJob) => {
  if (job.hourly_rates?.length) {
    const [minRate, maxRate] = job.hourly_rates;
    return `$${minRate}${maxRate ? `-${maxRate}` : ""} / hr`;
  }

  if (job.fixed_price !== null && job.fixed_price !== undefined) {
    return `$${job.fixed_price} fixed`;
  }

  return null;
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const EmptyBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-lg bg-[#FAFAFC] px-3 py-2 text-sm text-[#8A8A8A]">
    {children}
  </div>
);

const DetailMetric: React.FC<{ label: string; value?: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex items-start justify-between gap-3 py-2">
    <p className="text-xs font-medium text-[#8A8A8A]">{label}</p>
    <div className="max-w-[170px] text-right text-sm font-medium text-[#141414]">
      {value || <span className="font-normal text-[#8A8A8A]">Not provided</span>}
    </div>
  </div>
);

const HeaderAction: React.FC<{
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  asChild?: boolean;
  className?: string;
}> = ({ label, children, onClick, asChild, className }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <IconButton
        type="button"
        variant="outline"
        size="md"
        asChild={asChild}
        className={cn(
          "h-9 w-9 rounded-[10px] border-transparent bg-transparent shadow-none hover:bg-[#F6F8FF]",
          className,
        )}
        aria-label={label}
        onClick={onClick}
      >
        {children}
      </IconButton>
    </TooltipTrigger>
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);

const CollectionsPicker: React.FC<{
  options: CollectionOption[];
  value: number[];
  disabled: boolean;
  onChange: (value: number[]) => void;
}> = ({ options, value, disabled, onChange }) => {
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          className="h-9 w-full justify-between rounded-[10px] border-transparent bg-[#FAFAFC] px-3 text-left text-xs font-normal text-[#575757] shadow-none hover:bg-[#F6F8FF]"
        >
          <span className="truncate">
            {selectedNames.length
              ? selectedNames.join(", ")
              : "Add to collections..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] p-0">
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
  );
};

const JobDetails: React.FC<JobDetailsProps> = ({
  job,
  isOpen,
  onClose,
  onJobUpdate,
  collectionNameById,
  availableCollections,
}) => {
  const [jobData, setJobData] = useState<UpworkJob>(job);
  const [selectedCollectionsToAdd, setSelectedCollectionsToAdd] = useState<
    number[]
  >([]);
  const [isUpdatingCollections, setIsUpdatingCollections] = useState(false);
  const [hasCopiedJson, setHasCopiedJson] = useState(false);
  const [hasCopiedLink, setHasCopiedLink] = useState(false);

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
    setHasCopiedJson(false);
    setHasCopiedLink(false);
  }, [job]);

  useEffect(() => {
    if (!hasCopiedJson) return;
    const timeout = window.setTimeout(() => setHasCopiedJson(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [hasCopiedJson]);

  useEffect(() => {
    if (!hasCopiedLink) return;
    const timeout = window.setTimeout(() => setHasCopiedLink(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [hasCopiedLink]);

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

  const handleRemoveCollection = (collectionId: number) => {
    const current = jobData.collections ?? job.collections ?? [];
    updateCollections(current.filter((id) => id !== collectionId));
  };

  const handleAddCollection = () => {
    if (!selectedCollectionsToAdd.length) return;
    const current = jobData.collections ?? job.collections ?? [];
    const updated = Array.from(
      new Set([...current, ...selectedCollectionsToAdd]),
    );
    updateCollections(updated);
    setSelectedCollectionsToAdd([]);
  };

  const upworkUrl = `https://www.upwork.com/jobs/${job.id}`;

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(jobData, null, 2));
    setHasCopiedJson(true);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(upworkUrl);
    setHasCopiedLink(true);
  };

  const payment = formatPayment(job);

  return (
    <TooltipProvider>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            onClose();
          }
        }}
      >
        <DialogContent className="max-h-[92vh] max-w-5xl gap-0 overflow-hidden rounded-xl border-0 bg-white p-0 shadow-xl">
          <DialogHeader className="sticky top-0 z-10 bg-white/95 px-8 py-6 pr-16 shadow-[0_1px_0_rgba(20,20,20,0.06)] backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTitle className="line-clamp-2 max-h-14 text-xl font-semibold leading-7 text-[#141414]">
                      {job.title}
                    </DialogTitle>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md">{job.title}</TooltipContent>
                </Tooltip>
                <DialogDescription className="flex flex-wrap items-center gap-2 text-sm text-[#6B7280]">
                  <span>{job.experience || "Experience not specified"}</span>
                  <span className="h-1 w-1 rounded-full bg-[#C8C8C8]" />
                  <span>{formatDate(job.created_at)}</span>
                  {job.connects && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-[#C8C8C8]" />
                      <span>{parseInt(job.connects)} connects</span>
                    </>
                  )}
                </DialogDescription>
              </div>

              <div className="flex shrink-0 items-center gap-2 rounded-xl bg-[#FAFAFC] p-1">
                <HeaderAction
                  label={
                    hasCopiedJson
                      ? "Copied job JSON"
                      : "Copy job as JSON to clipboard"
                  }
                  onClick={handleCopyJson}
                >
                  {hasCopiedJson ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                </HeaderAction>
                <HeaderAction
                  label={hasCopiedLink ? "Copied job link" : "Copy job link"}
                  onClick={handleCopyLink}
                >
                  {hasCopiedLink ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Link className="h-4 w-4" />
                  )}
                </HeaderAction>
                <HeaderAction
                  label={
                    jobData.is_bookmarked
                      ? "Remove from bookmarks"
                      : "Bookmark job"
                  }
                  onClick={handleBookmark}
                  className={jobData.is_bookmarked ? "text-[#1823F0]" : ""}
                >
                  <Bookmark
                    className={cn(
                      "h-4 w-4",
                      jobData.is_bookmarked && "fill-current",
                    )}
                  />
                </HeaderAction>
                <HeaderAction label="Open on Upwork" asChild>
                  <a href={upworkUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </HeaderAction>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(92vh-104px)]">
            <div className="grid gap-8 px-8 py-8 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="flex min-w-0 flex-col gap-8">
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-[#141414]">
                    Description
                  </h3>
                  {job.description ? (
                    <div className="rounded-xl bg-[#FAFAFC] px-4 py-3">
                      <p className="whitespace-pre-line text-sm leading-7 text-[#575757]">
                        {job.description}
                      </p>
                    </div>
                  ) : (
                    <EmptyBlock>No description provided.</EmptyBlock>
                  )}
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-[#141414]">
                    Skills
                  </h3>
                  {job.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge
                          key={`${skill}-${index}`}
                          tone="info"
                          className="rounded-full border-transparent bg-[#F6F8FF] px-3 py-1 text-xs font-medium text-secondary-900"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <EmptyBlock>No skills listed.</EmptyBlock>
                  )}
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold text-[#141414]">
                    Collections
                  </h3>
                  <div className="space-y-4">
                    {collectionBadges.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2">
                        {collectionBadges.map(({ id, name }) => (
                          <Badge
                            key={id}
                            tone="info"
                            className="gap-2 rounded-full border border-[#E6E9F4] bg-[#F6F8FF] px-3 py-1 text-xs font-medium text-[#2A2627]"
                          >
                            {name}
                            <IconButton
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 rounded-full text-[#575757] hover:bg-white hover:text-[#141414]"
                              onClick={() => handleRemoveCollection(id)}
                              title="Remove from collection"
                              aria-label="Remove from collection"
                              type="button"
                            >
                              <X className="h-3 w-3" />
                            </IconButton>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <EmptyBlock>No collections assigned.</EmptyBlock>
                    )}

                    {availableCollections.length > 0 ? (
                      <>
                        <Separator className="bg-[#EFEFEF]" />
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <CollectionsPicker
                            options={availableOptions}
                            value={selectedCollectionsToAdd}
                            disabled={isUpdatingCollections}
                            onChange={setSelectedCollectionsToAdd}
                          />
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-[10px] shadow-none"
                            disabled={
                              selectedCollectionsToAdd.length === 0 ||
                              isUpdatingCollections
                            }
                            onClick={handleAddCollection}
                          >
                            {isUpdatingCollections ? "Adding..." : "Add"}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Separator className="bg-[#EFEFEF]" />
                        <EmptyBlock>No available collections to add.</EmptyBlock>
                      </>
                    )}
                  </div>
                </section>
              </div>

              <aside className="space-y-4">
                <div className="rounded-xl bg-[#FAFAFC] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-medium uppercase text-[#8A8A8A]">
                        Status
                      </p>
                    </div>
                    <JobStatusSelect
                      status={jobData.status}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-[#FAFAFC] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#141414]">
                      Summary
                    </h3>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-[10px] border-transparent bg-white shadow-none hover:bg-[#F6F8FF]"
                    >
                      <a
                        href={upworkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Upwork
                      </a>
                    </Button>
                  </div>
                  <div className="divide-y divide-[#ECEEF3]">
                    <DetailMetric label="Payment" value={payment} />
                    <DetailMetric label="Experience" value={job.experience} />
                    <DetailMetric
                      label="Connects"
                      value={job.connects ? parseInt(job.connects) : undefined}
                    />
                    <DetailMetric
                      label="Posted"
                      value={formatDate(job.created_at)}
                    />
                    <DetailMetric
                      label="Total spent"
                      value={
                        job.total_spent !== null ? `$${job.total_spent}` : undefined
                      }
                    />
                    <DetailMetric
                      label="Industry"
                      value={job.client_industry || undefined}
                    />
                    <DetailMetric label="Job ID" value={job.id} />
                  </div>
                </div>
              </aside>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default JobDetails;
