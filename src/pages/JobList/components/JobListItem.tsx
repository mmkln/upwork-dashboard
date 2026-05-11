import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { UpworkJob, JobStatus } from "../../../models";
import { updateUpworkJob } from "../../../services";
import { JobStatusSelect } from "../../../components";
import Card from "../../../components/ui/Card";

interface JobListItemProps {
  job: UpworkJob;
  onClick: (job: UpworkJob) => void;
  onJobUpdate: (job: UpworkJob) => void;
  isLastClicked?: boolean;
  collectionNameById: Record<number, string>;
  availableCollections: { id: number; name: string }[];
}

const JobListItem: React.FC<JobListItemProps> = ({
  job,
  onClick,
  onJobUpdate,
  isLastClicked = false,
  collectionNameById,
  availableCollections,
}) => {
  const [jobData, setJobData] = useState<UpworkJob>(job);
  const [selectedCollectionsToAdd, setSelectedCollectionsToAdd] = useState<number[]>([]);
  const [isUpdatingCollections, setIsUpdatingCollections] = useState(false);

  const availableOptions = useMemo(
    () =>
      availableCollections
        .filter(
          (collection) =>
            !(jobData.collections ?? job.collections ?? []).includes(collection.id),
        )
        .map((collection) => ({
          value: collection.id,
          label: collection.name,
        })),
    [availableCollections, job.collections, jobData.collections],
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

  useEffect(() => {
    setJobData(job);
  }, [job]);

  const collectionBadges = (jobData.collections ?? job.collections ?? [])
    .map((collectionId) => ({
      id: collectionId,
      name: collectionNameById[collectionId],
    }))
    .filter((entry): entry is { id: number; name: string } => Boolean(entry.name));

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

  const handleRemoveCollection = (collectionId: number, event?: React.MouseEvent) => {
    event?.stopPropagation();
    const current = jobData.collections ?? job.collections ?? [];
    const updated = current.filter((id) => id !== collectionId);
    updateCollections(updated);
  };

  const handleAddCollection = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!selectedCollectionsToAdd.length) return;
    const current = jobData.collections ?? job.collections ?? [];
    const merged = Array.from(new Set([...current, ...selectedCollectionsToAdd]));
    updateCollections(merged);
    setSelectedCollectionsToAdd([]);
  };

  const formatPostedTime = (dateString: string) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const minutes = Math.max(1, Math.round(diffMs / 60000));
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.round(hours / 24);
    return `${days} days ago`;
  };

  const priceInfo = (() => {
    if (job.hourly_rates && job.hourly_rates.length > 0) {
      const value = Number(job.hourly_rates[0]);
      return {
        price: Number.isNaN(value) ? "-" : `$${value.toFixed(2)}`,
        type: "/ hr",
      };
    }
    if (job.fixed_price != null) {
      const value = Number(job.fixed_price);
      return {
        price: Number.isNaN(value) ? "-" : `$${value.toFixed(2)}`,
        type: "(fixed)",
      };
    }
    return { price: "-", type: "" };
  })();

  return (
    <Card shadow={true} isHighlighted={isLastClicked}>
      <div className="group flex flex-col gap-4 p-4 cursor-pointer" onClick={() => onClick(job)}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-normal text-[#575757]">
            {formatPostedTime(job.created_at)}
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-medium text-[#575757]">
                {priceInfo.price}
              </span>
              {priceInfo.type && (
                <span className="text-[10px] font-normal text-[#8F9295]">
                  {priceInfo.type}
                </span>
              )}
            </div>
            <button
              className={`transition-opacity ${
                jobData.is_bookmarked
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              }`}
              title={jobData.is_bookmarked ? "Remove from bookmarks" : "Bookmark job"}
              onClick={(event) => {
                event.stopPropagation();
                handleBookmark();
              }}
            >
              {jobData.is_bookmarked ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="#575757"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.7287 2.21471C12.462 2.30004 13 2.93271 13 3.67137V14L8 11.5L3 14V3.67137C3 2.93271 3.53733 2.30004 4.27133 2.21471C6.74879 1.92713 9.25121 1.92713 11.7287 2.21471Z"
                    stroke="#575757"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="min-h-[40px] break-words text-[14px] font-medium leading-5 text-primary-900 line-clamp-2">
              {job.title}
            </h3>
            <p className="line-clamp-2 text-[10px] font-normal leading-5 text-[#575757]">
              {job.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 max-h-[88px] overflow-hidden">
            {job.skills.map((skill, index) => (
              <span
                key={index}
                className="rounded-[18px] bg-[#F6F8FF] px-[10px] py-1 text-[10px] font-medium leading-4 text-secondary-900"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {collectionBadges.length > 0 ? (
                collectionBadges.map(({ id, name }) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 rounded-[18px] border border-[#E6E9F4] bg-[#F6F8FF] px-[10px] py-1 text-[12px] font-medium text-[#2A2627]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {name}
                    <button
                      className="text-[#575757] hover:text-[#141414]"
                      title="Remove from collection"
                      onClick={(e) => handleRemoveCollection(id, e)}
                    >
                      x
                    </button>
                  </span>
                ))
              ) : (
                <span
                  className="text-[10px] text-[#8F9295]"
                  onClick={(e) => e.stopPropagation()}
                >
                  No collections
                </span>
              )}
            </div>

            {availableCollections.length > 0 && (
              <div
                className="flex flex-wrap items-center gap-2 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="min-w-[180px]">
                  <Select
                    isMulti
                    classNamePrefix="select"
                    value={availableOptions.filter((option) =>
                      selectedCollectionsToAdd.includes(option.value),
                    )}
                    onChange={(options) =>
                      setSelectedCollectionsToAdd(
                        (options || []).map((opt) => opt.value as number),
                      )
                    }
                    options={availableOptions}
                    placeholder="Add to collections..."
                    isDisabled={isUpdatingCollections}
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: "34px",
                        borderColor: "#d1d5db",
                        boxShadow: "none",
                        "&:hover": { borderColor: "#9ca3af" },
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        padding: "2px 6px",
                      }),
                      indicatorsContainer: (base) => ({
                        ...base,
                        padding: "2px",
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: "#e0ebff",
                        color: "#1d4ed8",
                      }),
                      multiValueLabel: (base) => ({
                        ...base,
                        color: "#1d4ed8",
                      }),
                    }}
                  />
                </div>
                <button
                  className="px-2 py-1 rounded-[8px] bg-[#1823F0] text-white disabled:opacity-50"
                  disabled={selectedCollectionsToAdd.length === 0 || isUpdatingCollections}
                  onClick={handleAddCollection}
                >
                  {isUpdatingCollections ? "..." : "Add"}
                </button>
              </div>
            )}

            <div className="flex items-center justify-end">
              <JobStatusSelect
                status={jobData.status}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default JobListItem;
