import type {
  MarketSignalFilters,
  MarketSignalJob,
  RelevanceStatus,
} from "./types";

export const filterSignalJobs = (
  jobs: MarketSignalJob[],
  filters: MarketSignalFilters,
) => {
  const keyword = filters.keyword.trim().toLowerCase();

  return jobs.filter((job) => {
    if (
      filters.relevanceStatus !== "All" &&
      job.relevanceStatus !== filters.relevanceStatus
    ) {
      return false;
    }
    if (
      filters.requestCategory !== "All" &&
      job.requestCategory !== filters.requestCategory
    ) {
      return false;
    }
    if (filters.clientType !== "All" && job.clientType !== filters.clientType) {
      return false;
    }
    if (filters.buyerNeed !== "All" && job.buyerNeed !== filters.buyerNeed) {
      return false;
    }
    if (
      filters.requiredSkill !== "All" &&
      !job.requiredSkills.includes(filters.requiredSkill)
    ) {
      return false;
    }
    if (
      filters.relatedTool !== "All" &&
      !job.relatedTools.includes(filters.relatedTool)
    ) {
      return false;
    }
    if (filters.minimumScore && job.marketSignalScore < filters.minimumScore) {
      return false;
    }
    if (!keyword) return true;

    return [
      job.sourceJob.title,
      job.sourceJob.description,
      job.requestCategory,
      job.clientType,
      job.problem,
      job.buyerNeed,
      job.budgetSignal,
      job.urgencySignal,
      job.requiredSkills.join(" "),
      job.relatedTools.join(" "),
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });
};

export const getRelevanceTone = (
  status: RelevanceStatus,
): "success" | "info" | "neutral" => {
  if (status === "Relevant") return "success";
  if (status === "Maybe Relevant") return "info";
  return "neutral";
};

