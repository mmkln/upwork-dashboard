import React, { useEffect, useState } from "react";
import { Bookmark, Clock3 } from "lucide-react";
import { UpworkJob } from "../../../models";
import { useUpdateJobMutation } from "../../../features/jobs";
import { Badge, Card, IconButton } from "../../../shared/ui";
import { formatRelativeTime } from "../../../shared/formatters";
import { cn } from "lib/utils";

interface JobListItemProps {
  job: UpworkJob;
  onClick: (job: UpworkJob) => void;
  onJobUpdate: (job: UpworkJob) => void;
  isLastClicked?: boolean;
  collectionNameById: Record<number, string>;
}

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

const formatStatus = (status: string) =>
  status.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());

const JobListItem: React.FC<JobListItemProps> = ({
  job,
  onClick,
  onJobUpdate,
  isLastClicked = false,
  collectionNameById,
}) => {
  const [jobData, setJobData] = useState<UpworkJob>(job);
  const updateJobMutation = useUpdateJobMutation();

  useEffect(() => {
    setJobData(job);
  }, [job]);

  const collectionBadges = (jobData.collections ?? job.collections ?? [])
    .map((collectionId) => ({
      id: collectionId,
      name: collectionNameById[collectionId],
    }))
    .filter((entry): entry is { id: number; name: string } =>
      Boolean(entry.name),
    );

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

  const priceInfo = getPriceInfo(job);
  const visibleSkills = job.skills.slice(0, 6);
  const hiddenSkillCount = Math.max(0, job.skills.length - visibleSkills.length);
  const visibleCollections = collectionBadges.slice(0, 2);
  const hiddenCollectionCount = Math.max(
    0,
    collectionBadges.length - visibleCollections.length,
  );

  return (
    <Card
      className={cn(
        "h-full overflow-hidden p-0 transition-colors duration-motion-fast ease-motion-standard",
        isLastClicked && "ring-2 ring-action/30",
      )}
    >
      <article
        className="group flex h-full cursor-pointer flex-col gap-card p-card transition-colors duration-motion-fast ease-motion-standard hover:bg-fill-tertiary"
        onClick={() => onClick(job)}
      >
        <div className="flex items-start justify-between gap-control">
          <div className="flex min-w-0 flex-wrap items-center gap-item text-label text-text-muted">
            <span className="inline-flex items-center gap-item">
              <Clock3 className="h-3.5 w-3.5" />
              {formatRelativeTime(job.created_at)}
            </span>
            {job.connects && (
              <span className="inline-flex min-h-control-mini items-center justify-center rounded-full bg-surface-muted px-control py-0 leading-none">
                {parseInt(job.connects)} connects
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-item">
            <div className="inline-flex min-h-control-mini items-center justify-center rounded-full bg-action-muted px-control py-0 text-right leading-none">
              <span className="text-label text-text-primary">
                {priceInfo.price}
              </span>
              {priceInfo.type && (
                <span className="ml-micro text-label text-text-muted">
                  {priceInfo.type}
                </span>
              )}
            </div>
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "transition-opacity duration-motion-fast ease-motion-standard",
                jobData.is_bookmarked
                  ? "opacity-100 text-action"
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

        <div className="flex flex-1 flex-col gap-control">
          <div className="space-y-item">
            <h3 className="line-clamp-2 min-h-[40px] break-words text-ui text-text-primary">
              {job.title}
            </h3>
            <p className="line-clamp-3 text-body text-text-secondary">
              {job.description || "No description provided."}
            </p>
          </div>

          <div className="flex flex-wrap gap-tag">
            {visibleSkills.length > 0 ? (
              <>
                {visibleSkills.map((skill) => (
                  <Badge
                    key={skill}
                    tone="info"
                    className="text-label text-text-primary"
                  >
                    {skill}
                  </Badge>
                ))}
                {hiddenSkillCount > 0 && (
                  <Badge tone="neutral" className="text-label text-text-muted">
                    +{hiddenSkillCount}
                  </Badge>
                )}
              </>
            ) : (
              <span className="inline-flex min-h-control-mini items-center justify-center rounded-full bg-block-subtle px-control py-0 text-label leading-none text-text-muted">
                No skills listed
              </span>
            )}
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-control border-t border-separator pt-component">
          <div className="flex min-w-0 flex-wrap items-center gap-tag">
            {visibleCollections.length > 0 ? (
              <>
                {visibleCollections.map(({ id, name }) => (
                  <Badge
                    key={id}
                    tone="neutral"
                    className="max-w-chip text-label text-text-secondary"
                  >
                    <span className="truncate">{name}</span>
                  </Badge>
                ))}
                {hiddenCollectionCount > 0 && (
                  <Badge tone="neutral" className="text-label text-text-muted">
                    +{hiddenCollectionCount}
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-label text-text-muted">No collections</span>
            )}
          </div>

          <Badge tone="neutral" className="text-label text-text-secondary">
            {formatStatus(jobData.status)}
          </Badge>
        </div>
      </article>
    </Card>
  );
};

export default JobListItem;
