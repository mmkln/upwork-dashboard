import { apiClient } from "../../../services/apiService";
import type {
  CreateMarketResearchPayload,
  CreateJobsSnapshotPayload,
  ExtractSnapshotSignalsPayload,
  ExtractSnapshotSignalsResult,
  JobsSnapshot,
  JobsSnapshotValidationErrors,
  MarketResearch,
  MarketResearchPayload,
  SnapshotSignalsQuery,
  SnapshotSignalsResponse,
  UpdateMarketSignalPayload,
  UpdateMarketResearchPayload,
} from "../types";

const MARKET_RESEARCH_ENDPOINT = "/market-research/";
const APPLIED_FILTERS_ERROR = "applied_filters must be an object.";

const hasOwn = <T extends object>(value: T, key: PropertyKey) =>
  Object.prototype.hasOwnProperty.call(value, key);

const buildMarketResearchPayload = (
  payload: Partial<MarketResearchPayload>,
): Partial<MarketResearchPayload> => {
  const nextPayload: Partial<MarketResearchPayload> = {};
  if (hasOwn(payload, "title")) nextPayload.title = payload.title;
  if (hasOwn(payload, "description")) {
    nextPayload.description = payload.description;
  }
  return nextPayload;
};

export class JobsSnapshotValidationError extends Error {
  errors: JobsSnapshotValidationErrors;

  constructor(errors: JobsSnapshotValidationErrors) {
    super("Invalid jobs snapshot payload.");
    this.name = "JobsSnapshotValidationError";
    this.errors = errors;
    Object.setPrototypeOf(this, JobsSnapshotValidationError.prototype);
  }
}

const buildJobsSnapshotPayload = (
  payload: CreateJobsSnapshotPayload,
): CreateJobsSnapshotPayload => {
  if (
    payload.applied_filters == null ||
    Array.isArray(payload.applied_filters) ||
    typeof payload.applied_filters !== "object"
  ) {
    throw new JobsSnapshotValidationError({
      applied_filters: [APPLIED_FILTERS_ERROR],
    });
  }
  return {
    applied_filters: payload.applied_filters,
  };
};

export const fetchMarketResearchList = async (options?: {
  signal?: AbortSignal;
}): Promise<MarketResearch[]> => {
  const response = await apiClient.get<MarketResearch[]>(
    MARKET_RESEARCH_ENDPOINT,
    { signal: options?.signal },
  );
  return response.data;
};

export const createMarketResearch = async (
  payload: CreateMarketResearchPayload,
): Promise<MarketResearch> => {
  const response = await apiClient.post<MarketResearch>(
    MARKET_RESEARCH_ENDPOINT,
    buildMarketResearchPayload(payload),
  );
  return response.data;
};

export const fetchMarketResearch = async (
  id: string,
  options?: { signal?: AbortSignal },
): Promise<MarketResearch> => {
  const response = await apiClient.get<MarketResearch>(
    `${MARKET_RESEARCH_ENDPOINT}${id}/`,
    { signal: options?.signal },
  );
  return response.data;
};

export const updateMarketResearch = async (
  id: string,
  payload: UpdateMarketResearchPayload,
): Promise<MarketResearch> => {
  const response = await apiClient.patch<MarketResearch>(
    `${MARKET_RESEARCH_ENDPOINT}${id}/`,
    buildMarketResearchPayload(payload),
  );
  return response.data;
};

export const deleteMarketResearch = async (id: string): Promise<void> => {
  await apiClient.delete(`${MARKET_RESEARCH_ENDPOINT}${id}/`);
};

export const createJobsSnapshot = async (
  researchId: string,
  payload: CreateJobsSnapshotPayload,
): Promise<JobsSnapshot> => {
  const response = await apiClient.post<JobsSnapshot>(
    `${MARKET_RESEARCH_ENDPOINT}${researchId}/create_snapshot/`,
    buildJobsSnapshotPayload(payload),
  );
  return response.data;
};

export const extractSnapshotSignals = async (
  researchId: string,
  payload: ExtractSnapshotSignalsPayload,
): Promise<ExtractSnapshotSignalsResult> => {
  const response = await apiClient.post<ExtractSnapshotSignalsResult>(
    `${MARKET_RESEARCH_ENDPOINT}${researchId}/extract_snapshot_signals/`,
    payload,
  );
  return response.data;
};

export const fetchSnapshotSignals = async (
  researchId: string,
  query: SnapshotSignalsQuery,
  options?: { signal?: AbortSignal },
): Promise<SnapshotSignalsResponse> => {
  const response = await apiClient.get<SnapshotSignalsResponse>(
    `${MARKET_RESEARCH_ENDPOINT}${researchId}/snapshot_signals/`,
    {
      params: query,
      signal: options?.signal,
    },
  );
  return response.data;
};

export const updateMarketSignal = async (
  signalId: string,
  payload: UpdateMarketSignalPayload,
): Promise<unknown> => {
  const response = await apiClient.patch(
    `/market-signals/${signalId}/`,
    payload,
  );
  return response.data;
};
