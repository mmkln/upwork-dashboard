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

export type SnapshotSignalsSummary = {
  total_snapshot_jobs: number;
  total_signals: number;
  pending: number;
  extracted: number;
  needs_review: number;
  failed: number;
  manually_edited: number;
  missing_signals: number;
};

export type SnapshotSignalRow = {
  signal_id: string;
  job: {
    id: string;
    title: string;
    country: string | null;
    fixed_price: string | null;
    hourly_rates: number[] | null;
    total_spent: string | null;
    is_payment_verified: boolean;
  };
  signal: {
    request_category: string;
    client_type: string;
    niche: string;
    buyer_need: string;
    problem: string;
    exact_client_language: string[];
    value_connection: string;
    budget_signal: string;
    urgency_signal: string;
    extraction_status: string;
    error: string;
  };
};

export type SnapshotSignalsQuery = {
  snapshot_id: string;
  status?: string;
  search?: string;
  request_category?: string;
  client_type?: string;
  niche?: string;
  buyer_need?: string;
  limit?: number;
  offset?: number;
};

export type SnapshotSignalsResponse = {
  snapshot_id: string;
  total: number;
  limit: number;
  offset: number;
  summary: SnapshotSignalsSummary;
  results: SnapshotSignalRow[];
};

export type UpdateMarketSignalPayload = Partial<SnapshotSignalRow["signal"]>;
