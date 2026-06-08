export type MarketResearch = {
  id: string;
  owner: number;
  title: string;
  description: string;
  snapshots: JobsSnapshot[];
  created_at: string;
  updated_at: string;
};

export type MarketResearchPayload = Pick<
  MarketResearch,
  "title" | "description"
>;

export type CreateMarketResearchPayload = Pick<
  MarketResearch,
  "title"
> &
  Partial<Pick<MarketResearch, "description">>;

export type UpdateMarketResearchPayload = Partial<MarketResearchPayload>;

export type JobSnapshotFilters = {
  search?: string;
  collections?: string;
  job_type?: "fixed" | "hourly" | "unspecified";
  fixed_price_min?: string;
  fixed_price_max?: string;
  hourly_rate_min?: string;
  hourly_rate_max?: string;
  skills?: string;
  instruments?: string;
  statuses?: string;
  experience?: string;
  bookmarked?: "true" | "false" | "1" | "0" | "yes" | "no";
};

export type JobsSnapshot = {
  id: string;
  owner: number;
  title: string;
  research: string;
  applied_filters: Record<string, unknown>;
  job_ids: string[];
  created_at: string;
};

export type CreateJobsSnapshotPayload = {
  applied_filters: JobSnapshotFilters;
};

export type JobsSnapshotValidationErrors = {
  applied_filters?: string[];
};

export type ExtractSnapshotSignalsPayload = {
  snapshot_id: string;
  retry_failed?: boolean;
  limit?: number;
};

export type ExtractSnapshotSignalsResult = {
  snapshot_id: string;
  total_signals: number;
  processed: number;
  extracted: number;
  needs_review: number;
  failed: number;
  skipped_extracted: number;
  skipped_manually_edited: number;
  remaining_pending: number;
};
