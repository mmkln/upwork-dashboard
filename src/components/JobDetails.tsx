import React, { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Check,
  Clipboard,
  ExternalLink,
  Folder,
  FolderPlus,
  Link,
  X,
} from "lucide-react";
import { JobStatus, UpworkJob } from "../models";
import { JobStatusSelect } from ".";
import {
  serializeJobForExport,
  stripPreparedJobMeta,
  useUpdateJobMutation,
} from "../features/jobs";
import {
  Badge,
  Button,
  Card,
  DetailRow,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
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

const DescriptionReader: React.FC<{ description: string }> = ({
  description,
}) => (
  <Card className="flex min-h-0 flex-col overflow-hidden p-0">
    <div className="border-b border-separator px-block py-component">
      <h3 className="text-ui text-text-primary">Description</h3>
    </div>
    {description ? (
      <ScrollArea className="max-h-overlay-body">
        <div className="px-block py-component">
          <p className="max-w-readable whitespace-pre-line text-body text-text-secondary">
            {description}
          </p>
        </div>
      </ScrollArea>
    ) : (
      <div className="px-block py-component">
        <MutedBlock>No description provided.</MutedBlock>
      </div>
    )}
  </Card>
);

const JobDetails: React.FC<JobDetailsProps> = ({
  job,
  isOpen,
  onClose,
  onJobUpdate,
  collectionNameById,
  availableCollections,
}) => {
  const [jobData, setJobData] = useState<UpworkJob>(job);
  const [isUpdatingCollections, setIsUpdatingCollections] = useState(false);
  const [hasCopiedJson, setHasCopiedJson] = useState(false);
  const [hasCopiedLink, setHasCopiedLink] = useState(false);

  // New TanStack Query mutation (updates the query cache for all consumers)
  const updateJobMutation = useUpdateJobMutation();

  const availableCollectionsToAdd = useMemo(
    () =>
      availableCollections.filter(
        (collection) =>
          !(jobData.collections ?? job.collections ?? []).includes(
            collection.id,
          ),
      ),
    [availableCollections, job.collections, jobData.collections],
  );

  useEffect(() => {
    setJobData(job);
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
    updateJobMutation
      .mutateAsync({ id: jobData.id, status })
      .then((updatedJob) => {
        setJobData(updatedJob);
        onJobUpdate(updatedJob);
      })
      .catch((error) => {
        console.error("Error updating job status:", error);
      });
  };

  const handleBookmark = () => {
    updateJobMutation
      .mutateAsync({ id: jobData.id, is_bookmarked: !jobData.is_bookmarked })
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

    updateJobMutation
      .mutateAsync({ id: jobData.id, collections: collectionIds })
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

  const handleAddCollection = (collectionId: number) => {
    const current = jobData.collections ?? job.collections ?? [];
    const updated = Array.from(new Set([...current, collectionId]));
    updateCollections(updated);
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
        <DialogContent className="max-h-overlay max-w-viewport-safe gap-0 overflow-hidden bg-surface-elevated p-0 backdrop-blur-none xl:max-w-modal-xl">
          <OverlayHeader className="sticky top-0 z-10 border-separator bg-surface-elevated pr-spacious text-center backdrop-blur-none sm:text-left">
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

          <ScrollArea className="max-h-overlay-detail-body bg-surface-elevated">
            <OverlayBody className="grid gap-panel xl:grid-cols-job-detail">
              <div className="flex min-w-0 flex-col gap-panel">
                <DescriptionReader description={job.description} />

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

              </div>

              <aside className="space-y-component">
                <Card className="p-component">
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
                </Card>

                <Card className="p-component">
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
                </Card>

                <Card className="space-y-component p-component">
                  <h3 className="text-ui text-text-primary">Collections</h3>
                  {collectionBadges.length > 0 ? (
                    <div className="flex flex-col gap-item">
                      {collectionBadges.map(({ id, name }) => (
                        <div
                          key={id}
                          className="flex min-h-control-small items-center justify-between gap-item rounded-control bg-block-subtle px-control py-tag text-ui text-text-primary"
                        >
                          <span className="flex min-w-0 items-center gap-item">
                            <Folder className="h-4 w-4 shrink-0 text-text-secondary" />
                            <span className="truncate">{name}</span>
                          </span>
                          <IconButton
                            variant="ghost"
                            size="sm"
                            className="h-control-mini w-control-mini shrink-0 rounded-full text-text-muted hover:bg-control-hover hover:text-text-primary"
                            onClick={() => handleRemoveCollection(id)}
                            disabled={isUpdatingCollections}
                            title="Remove from collection"
                            aria-label="Remove from collection"
                            type="button"
                          >
                            <X className="h-3 w-3" />
                          </IconButton>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <MutedBlock>No collections assigned.</MutedBlock>
                  )}

                  {availableCollectionsToAdd.length > 0 ? (
                    <>
                      {collectionBadges.length > 0 ? (
                        <Separator className="bg-separator" />
                      ) : null}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            size="sm"
                            variant="soft"
                            className="w-full justify-start rounded-control shadow-none"
                            disabled={isUpdatingCollections}
                          >
                            <FolderPlus className="h-4 w-4" />
                            {isUpdatingCollections
                              ? "Updating..."
                              : "Add to Collection"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="min-w-status-menu rounded-block p-item"
                        >
                          {availableCollectionsToAdd.map((collection) => (
                            <DropdownMenuItem
                              key={collection.id}
                              className="min-h-control-small gap-item px-control py-item"
                              onSelect={() => handleAddCollection(collection.id)}
                            >
                              <Folder className="h-4 w-4" />
                              <span className="truncate">{collection.name}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  ) : (
                    <>
                      {collectionBadges.length > 0 ? (
                        <>
                          <Separator className="bg-separator" />
                          <p className="text-label text-text-muted">
                            All collections assigned.
                          </p>
                        </>
                      ) : (
                        <MutedBlock>No available collections.</MutedBlock>
                      )}
                    </>
                  )}
                </Card>
              </aside>
            </OverlayBody>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default JobDetails;
