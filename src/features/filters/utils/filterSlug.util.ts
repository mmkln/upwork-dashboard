import { FilterState } from "../types";

const sanitizeSegment = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9+_\-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");

export const buildFilterSlug = (
  filters: FilterState,
  collectionsLookup: Record<number, string>,
): string => {
  const {
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
  } = filters;

  const parts: string[] = [];

  if (jobType && jobType !== "None") {
    parts.push(`type-${jobType.replace(/\s+/g, "-").toLowerCase()}`);
  }

  const isDefaultFixed =
    jobType === "Fixed Price" &&
    fixedPriceRange &&
    fixedPriceRange[0] === 0 &&
    fixedPriceRange[1] === 5000;
  const isDefaultHourly =
    jobType === "Hourly Rate" &&
    hourlyRateRange &&
    hourlyRateRange[0] === 0 &&
    hourlyRateRange[1] === 500;

  if (jobType === "Fixed Price" && fixedPriceRange && !isDefaultFixed) {
    parts.push(`fixed-${fixedPriceRange[0]}-${fixedPriceRange[1]}`);
  }
  if (jobType === "Hourly Rate" && hourlyRateRange && !isDefaultHourly) {
    parts.push(`hourly-${hourlyRateRange[0]}-${hourlyRateRange[1]}`);
  }
  if (selectedSkills.length) {
    parts.push(`skills-${selectedSkills.join("+")}`);
  }
  if (selectedInstruments.length) {
    parts.push(`tools-${selectedInstruments.join("+")}`);
  }
  if (selectedStatuses.length) {
    parts.push(`status-${selectedStatuses.join("+")}`);
  }
  if (selectedCollectionIds.length) {
    const names = selectedCollectionIds
      .map((id) => collectionsLookup[id] || `id${id}`)
      .join("+");
    parts.push(`collections-${names}`);
  }
  if (selectedExperience.length) {
    parts.push(`exp-${selectedExperience.join("+")}`);
  }
  if (titleFilter.trim()) {
    parts.push(`q-${titleFilter.trim()}`);
  }
  if (bookmarked) {
    parts.push("bookmarked");
  }

  const raw = parts.length ? parts.join("__") : "all";
  return sanitizeSegment(raw) || "all";
};
