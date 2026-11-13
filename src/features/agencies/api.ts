import type { PaginatedResponse } from "../../models";
import { apiClient } from "../../services/apiService";
import type {
  AgenciesQuery,
  AgencyDetails,
  AgencyListItem,
} from "./types";

export async function getAgencies(
  query: AgenciesQuery,
): Promise<PaginatedResponse<AgencyListItem>> {
  const response = await apiClient.get<PaginatedResponse<AgencyListItem>>(
    "/agencies/",
    { params: query },
  );

  return response.data;
}

export async function getAgency(recordId: string): Promise<AgencyDetails> {
  const response = await apiClient.get<AgencyDetails>(
    `/agencies/${encodeURIComponent(recordId)}/`,
  );

  return response.data;
}
