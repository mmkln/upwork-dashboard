import { apiClient } from "../../../services/apiService";
import type {
  CreateMarketResearchPayload,
  MarketResearch,
  MarketResearchPayload,
  MarketResearchValidationErrors,
  ReplaceMarketResearchPayload,
  UpdateMarketResearchPayload,
} from "../types";

const MARKET_RESEARCH_ENDPOINT = "/market-research/";
const JOBS_SNAPSHOT_ITEM_ERROR =
  "Each jobs_snapshot item must be a non-empty string.";

export class MarketResearchValidationError extends Error {
  errors: MarketResearchValidationErrors;

  constructor(errors: MarketResearchValidationErrors) {
    super("Invalid market research payload.");
    this.name = "MarketResearchValidationError";
    this.errors = errors;
    Object.setPrototypeOf(this, MarketResearchValidationError.prototype);
  }
}

const hasOwn = <T extends object>(value: T, key: PropertyKey) =>
  Object.prototype.hasOwnProperty.call(value, key);

const validateJobsSnapshot = (
  jobsSnapshot: unknown,
): string[] | undefined => {
  if (
    !Array.isArray(jobsSnapshot) ||
    jobsSnapshot.some(
      (item) => typeof item !== "string" || item.trim().length === 0,
    )
  ) {
    return [JOBS_SNAPSHOT_ITEM_ERROR];
  }
  return undefined;
};

const assertValidMarketResearchPayload = (
  payload: Partial<MarketResearchPayload>,
) => {
  const errors: MarketResearchValidationErrors = {};
  if (hasOwn(payload, "jobs_snapshot")) {
    const jobsSnapshotErrors = validateJobsSnapshot(payload.jobs_snapshot);
    if (jobsSnapshotErrors) {
      errors.jobs_snapshot = jobsSnapshotErrors;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new MarketResearchValidationError(errors);
  }
};

const buildMarketResearchPayload = (
  payload: Partial<MarketResearchPayload>,
): Partial<MarketResearchPayload> => {
  const nextPayload: Partial<MarketResearchPayload> = {};
  if (hasOwn(payload, "title")) nextPayload.title = payload.title;
  if (hasOwn(payload, "description")) {
    nextPayload.description = payload.description;
  }
  if (hasOwn(payload, "jobs_snapshot")) {
    nextPayload.jobs_snapshot = payload.jobs_snapshot;
  }
  assertValidMarketResearchPayload(nextPayload);
  return nextPayload;
};

export const fetchMarketResearchList = async (): Promise<MarketResearch[]> => {
  const response = await apiClient.get<MarketResearch[]>(
    MARKET_RESEARCH_ENDPOINT,
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
): Promise<MarketResearch> => {
  const response = await apiClient.get<MarketResearch>(
    `${MARKET_RESEARCH_ENDPOINT}${id}/`,
  );
  return response.data;
};

export const replaceMarketResearch = async (
  id: string,
  payload: ReplaceMarketResearchPayload,
): Promise<MarketResearch> => {
  const response = await apiClient.put<MarketResearch>(
    `${MARKET_RESEARCH_ENDPOINT}${id}/`,
    buildMarketResearchPayload(payload),
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
