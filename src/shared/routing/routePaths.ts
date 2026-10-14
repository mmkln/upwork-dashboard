export const ROUTE_PATHS = {
  home: "/",
  login: "/login",
  jobs: "/jobs",
  profiles: "/profiles",
  marketSignals: "/market-signals",
  marketSignalReview:
    "/market-signals/:researchId/snapshots/:snapshotId/review",
  radar: "/radar",
} as const;

export function getMarketSignalReviewPath(
  researchId: string,
  snapshotId: string,
) {
  return `/market-signals/${researchId}/snapshots/${snapshotId}/review`;
}
