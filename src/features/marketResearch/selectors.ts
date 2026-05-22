import type { JobsSnapshot, MarketResearch } from "./types";

export type MarketResearchSetupState =
  | "missing_title"
  | "missing_snapshot"
  | "complete";

export type MarketResearchSetupStatus = {
  isComplete: boolean;
  label: string;
  state: MarketResearchSetupState;
};

export const getMarketResearchSnapshots = (
  research: MarketResearch,
): JobsSnapshot[] =>
  Array.isArray(research.snapshots) ? research.snapshots : [];

export const getLatestMarketResearchSnapshot = (
  research: MarketResearch,
): JobsSnapshot | null => {
  const snapshots = getMarketResearchSnapshots(research);
  if (snapshots.length === 0) return null;

  return [...snapshots].sort(
    (firstSnapshot, secondSnapshot) =>
      new Date(secondSnapshot.created_at).getTime() -
      new Date(firstSnapshot.created_at).getTime(),
  )[0];
};

export const getLatestMarketResearchSnapshotJobIds = (
  research: MarketResearch,
): string[] => getLatestMarketResearchSnapshot(research)?.job_ids ?? [];

export const getMarketResearchSetupState = (
  research: MarketResearch,
): MarketResearchSetupState => {
  if (!research.title.trim()) return "missing_title";
  if (getMarketResearchSnapshots(research).length === 0) {
    return "missing_snapshot";
  }
  return "complete";
};

export const getMarketResearchSetupStatus = (
  research: MarketResearch,
): MarketResearchSetupStatus => {
  const state = getMarketResearchSetupState(research);

  if (state === "missing_title") {
    return {
      isComplete: false,
      label: "Title missing",
      state,
    };
  }

  if (state === "missing_snapshot") {
    return {
      isComplete: false,
      label: "Snapshot missing",
      state,
    };
  }

  return {
    isComplete: true,
    label: "Ready",
    state,
  };
};
