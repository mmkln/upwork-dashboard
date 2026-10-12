import {
  keepPreviousData,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { PaginatedResponse } from "../../models";
import { getProfile, getProfiles } from "./api";
import type {
  ProfileDetails,
  ProfileListItem,
  ProfilesQuery,
} from "./types";

export const profileKeys = {
  all: ["profiles"] as const,
  list: (query: ProfilesQuery) =>
    [...profileKeys.all, "list", query] as const,
  detail: (id: string) =>
    [...profileKeys.all, "detail", id] as const,
};

export const useProfiles = (
  query: ProfilesQuery,
): UseQueryResult<PaginatedResponse<ProfileListItem>, Error> =>
  useQuery<PaginatedResponse<ProfileListItem>>({
    queryKey: profileKeys.list(query),
    queryFn: () => getProfiles(query),
    placeholderData: keepPreviousData,
  });

export const useProfile = (
  id: string | null,
): UseQueryResult<ProfileDetails, Error> =>
  useQuery<ProfileDetails>({
    queryKey: profileKeys.detail(id ?? ""),
    queryFn: () => getProfile(id!),
    enabled: Boolean(id),
  });
