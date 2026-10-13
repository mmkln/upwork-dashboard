import type { PaginatedResponse } from "../../models";
import { apiClient } from "../../services/apiService";
import type {
  ProfileDetails,
  ProfileListItem,
  ProfilesExportPayload,
  ProfilesExportQuery,
  ProfilesQuery,
} from "./types";

export async function getProfiles(
  query: ProfilesQuery,
): Promise<PaginatedResponse<ProfileListItem>> {
  const response = await apiClient.get<PaginatedResponse<ProfileListItem>>(
    "/profiles/",
    { params: query },
  );
  return response.data;
}

export async function getProfile(id: string): Promise<ProfileDetails> {
  const response = await apiClient.get<ProfileDetails>(
    `/profiles/${encodeURIComponent(id)}/`,
  );
  return response.data;
}

export async function getProfilesExport(
  query: ProfilesExportQuery,
): Promise<ProfilesExportPayload> {
  const response = await apiClient.get<ProfilesExportPayload>(
    "/profiles/export/",
    { params: query },
  );
  return response.data;
}
