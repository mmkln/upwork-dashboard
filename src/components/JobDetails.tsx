import React, { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Check,
  Clipboard,
  ExternalLink,
  Link,
  X,
} from "lucide-react";
import { JobStatus, UpworkJob } from "../models";
import { JobStatusSelect } from ".";
import {
  serializeJobForExport,
  stripPreparedJobMeta,
  updateJobBookmark,
  updateJobCollections,
  updateJobStatus,
} from "../features/jobs";
import {
  Badge,
  Button,
  DetailRow,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  IconButton,
  MultiSelect,
  MutedBlock,
  OverlayBody,
  OverlayHeader,
  ScrollArea,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TooltipIconButton,
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
    updateJobStatus(jobData.id, status)
      .then((updatedJob) => {
        setJobData(updatedJob);
        onJobUpdate(updatedJob);
      })
      .catch((error) => {
        console.error("Error updating job status:", error);
      });
  };

  const handleBookmark = () => {
    updateJobBookmark(jobData.id, !jobData.is_bookmarked)
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
    const optimisticJob = {
      ...stripPreparedJobMeta(jobData),
      collections: collectionIds,
    };
    setJobData(optimisticJob);
    onJobUpdate(optimisticJob);
    updateJobCollections(jobData.id, collectionIds)
      .then((updatedJob) => {
        setJobData(updatedJob);
        onJobUpdate(updatedJob);
      })
      .catch((error) => {
        console.error("Error updating job collections:", error);
        const rollbackJob = {
          ...stripPreparedJobMeta(jobData),
          collections: previous,
        };
        setJobData(rollbackJob);
        onJobUpdate(rollbackJob);
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
    await navigator.clipboard.writeText(
      JSON.stringify(serializeJobForExport(jobData), null, 2),
    );
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
        <DialogContent className="max-h-overlay max-w-modal-xl gap-0 overflow-hidden p-0">
          <OverlayHeader className="sticky top-0 z-10 pr-spacious text-center sm:text-left">
            <div className="flex flex-col gap-component lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-item">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTitle className="line-clamp-2 max-h-14 text-heading text-text-primary">
                      {job.title}
                    </DialogTitle>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md">{job.title}</TooltipContent>
                </Tooltip>
                <DialogDescription className="flex flex-wrap items-center gap-item text-body text-text-secondary">
                  <span>{job.experience || "Experience not specified"}</span>
                  <span className="h-1 w-1 rounded-full bg-border-strong" />
                  <span>{formatDate(job.created_at)}</span>
                  {job.connects && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-border-strong" />
                      <span>{parseInt(job.connects)} connects</span>
                    </>
                  )}
                </DialogDescription>
              </div>

              <div className="flex shrink-0 items-center gap-item rounded-control bg-island p-micro">
                <TooltipIconButton
                  label={
                    hasCopiedJson
                      ? "Copied job JSON"
                      : "Copy job as JSON to clipboard"
                  }
                  onClick={handleCopyJson}
                  variant="outline"
                  size="md"
                  className="h-control-small w-control-small rounded-control border-transparent bg-transparent shadow-none hover:bg-island-hover"
                >
                  {hasCopiedJson ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                </TooltipIconButton>
                <TooltipIconButton
                  label={hasCopiedLink ? "Copied job link" : "Copy job link"}
                  onClick={handleCopyLink}
                  variant="outline"
                  size="md"
                  className="h-control-small w-control-small rounded-control border-transparent bg-transparent shadow-none hover:bg-island-hover"
                >
                  {hasCopiedLink ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Link className="h-4 w-4" />
                  )}
                </TooltipIconButton>
                <TooltipIconButton
                  label={
                    jobData.is_bookmarked
                      ? "Remove from bookmarks"
                      : "Bookmark job"
                  }
                  onClick={handleBookmark}
                  variant="outline"
                  size="md"
                  className={cn(
                    "h-control-small w-control-small rounded-control border-transparent bg-transparent shadow-none hover:bg-island-hover",
                    jobData.is_bookmarked ? "text-action" : "",
                  )}
                >
                  <Bookmark
                    className={cn(
                      "h-4 w-4",
                      jobData.is_bookmarked && "fill-current",
                    )}
                  />
                </TooltipIconButton>
                <TooltipIconButton
                  label="Open on Upwork"
                  asChild
                  variant="outline"
                  size="md"
                  className="h-control-small w-control-small rounded-control border-transparent bg-transparent shadow-none hover:bg-island-hover"
                >
                  <a href={upworkUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </TooltipIconButton>
              </div>
            </div>
          </OverlayHeader>

          <ScrollArea className="max-h-overlay-detail-body">
            <OverlayBody className="grid gap-panel lg:grid-cols-job-detail">
              <div className="flex min-w-0 flex-col gap-panel">
                <section className="space-y-control">
                  <h3 className="text-ui text-text-primary">
                    Description
                  </h3>
                  {job.description ? (
                    <div className="rounded-control bg-block-subtle px-component py-control">
                      <p className="whitespace-pre-line text-body text-text-secondary">
                        {job.description}
                      </p>
                    </div>
                  ) : (
                    <MutedBlock>No description provided.</MutedBlock>
                  )}
                </section>

                <section className="space-y-control">
                  <h3 className="text-ui text-text-primary">
                    Skills
                  </h3>
                  {job.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-item">
                      {job.skills.map((skill, index) => (
                        <Badge
                          key={`${skill}-${index}`}
                          tone="info"
                          className="bg-action-muted text-text-primary"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <MutedBlock>No skills listed.</MutedBlock>
                  )}
                </section>

                <section className="space-y-control">
                  <h3 className="text-ui text-text-primary">
                    Collections
                  </h3>
                  <div className="space-y-component">
                    {collectionBadges.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-item">
                        {collectionBadges.map(({ id, name }) => (
                          <Badge
                            key={id}
                            tone="info"
                            className="gap-item border border-border bg-action-muted text-text-primary"
                          >
                            {name}
                            <IconButton
                              variant="ghost"
                              size="sm"
                              className="ml-micro h-control-mini w-control-mini rounded-full text-text-secondary hover:bg-surface hover:text-text-primary"
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
                      <MutedBlock>No collections assigned.</MutedBlock>
                    )}

                    {availableCollections.length > 0 ? (
                      <>
                        <Separator className="bg-separator" />
                        <div className="flex flex-col gap-item sm:flex-row sm:items-center">
                          <MultiSelect
                            options={availableOptions}
                            value={selectedCollectionsToAdd}
                            disabled={isUpdatingCollections}
                            onChange={setSelectedCollectionsToAdd}
                            placeholder="Add to collections..."
                            searchPlaceholder="Search collections..."
                            emptyText="No collections found."
                            className="h-control-small border-transparent bg-block-subtle text-ui text-text-secondary hover:bg-fill-tertiary"
                          />
                          <Button
                            type="button"
                            size="sm"
                            className="rounded-control shadow-none"
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
                        <Separator className="bg-separator" />
                        <MutedBlock>No available collections to add.</MutedBlock>
                      </>
                    )}
                  </div>
                </section>
              </div>

              <aside className="space-y-component">
                <div className="rounded-control bg-block-subtle p-component">
                  <div className="flex items-center justify-between gap-control">
                    <div>
                      <p className="text-label text-text-muted">
                        Status
                      </p>
                    </div>
                    <JobStatusSelect
                      status={jobData.status}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                </div>

                <div className="rounded-control bg-block-subtle p-component">
                  <div className="mb-control flex items-center justify-between">
                    <h3 className="text-ui text-text-primary">
                      Summary
                    </h3>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-control-small rounded-control border-transparent bg-block shadow-none hover:bg-fill-tertiary"
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
                  <div className="divide-y divide-separator">
                    <DetailRow label="Payment" value={payment} />
                    <DetailRow label="Experience" value={job.experience} />
                    <DetailRow
                      label="Connects"
                      value={job.connects ? parseInt(job.connects) : undefined}
                    />
                    <DetailRow
                      label="Posted"
                      value={formatDate(job.created_at)}
                    />
                    <DetailRow
                      label="Total spent"
                      value={
                        job.total_spent !== null ? `$${job.total_spent}` : undefined
                      }
                    />
                    <DetailRow
                      label="Industry"
                      value={job.client_industry || undefined}
                    />
                    <DetailRow label="Job ID" value={job.id} />
                  </div>
                </div>
              </aside>
            </OverlayBody>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default JobDetails;
