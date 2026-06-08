import type { MarketResearch } from "../../marketResearch";
import type {
  MarketSignalJob,
  MarketSignalFilters,
  MarketSignalsBoardConfig,
  MarketSignalsFocusMode,
} from "../types";
import { getLatestMarketResearchSnapshotJobIds } from "../../marketResearch";
import { parseKeywordInput } from "./relevance";

export const mapMarketResearchToBoard = (
  research: MarketResearch,
): MarketSignalsBoardConfig => ({
  id: research.id,
  owner: research.owner,
  name: research.title,
  goal: research.description,
  marketQuery: research.title,
  jobsSnapshot: getLatestMarketResearchSnapshotJobIds(research),
  includeKeywords: parseKeywordInput(research.title.replace(/\s+/g, ",")),
  excludeKeywords: [],
  createdAt: research.created_at,
  updatedAt: research.updated_at,
});

export const sortSignalJobs = (jobs: MarketSignalJob[]) =>
  [...jobs].sort((a, b) => {
    const relevanceRank = {
      Relevant: 0,
      "Maybe Relevant": 1,
      Irrelevant: 2,
    };
    const relevanceDelta =
      relevanceRank[a.relevanceStatus] - relevanceRank[b.relevanceStatus];
    if (relevanceDelta !== 0) return relevanceDelta;
    if (b.marketSignalScore !== a.marketSignalScore) {
      return b.marketSignalScore - a.marketSignalScore;
    }
    return (
      new Date(b.sourceJob.created_at).getTime() -
      new Date(a.sourceJob.created_at).getTime()
    );
  });

export const getFocusJobs = (
  jobs: MarketSignalJob[],
  focusMode: MarketSignalsFocusMode,
) => {
  if (focusMode === "priority") {
    return jobs.filter(
      (job) => job.relevanceStatus === "Relevant" && job.marketSignalScore >= 4,
    );
  }
  if (focusMode === "review") {
    return jobs.filter(
      (job) =>
        job.relevanceStatus !== "Irrelevant" && job.userCorrections == null,
    );
  }
  if (focusMode === "corrected") {
    return jobs.filter((job) => job.userCorrections != null);
  }
  return jobs;
};

export const getSnapshotLabel = (board: MarketSignalsBoardConfig | null) => {
  if (!board) return "No research selected";
  return `${board.jobsSnapshot.length.toLocaleString()} saved jobs`;
};
