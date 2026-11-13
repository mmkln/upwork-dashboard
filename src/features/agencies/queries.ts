import {
  keepPreviousData,
  useQuery,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { PaginatedResponse } from "../../models";
import { getAgencies, getAgency } from "./api";
import type {
  AgenciesQuery,
  AgencyDetails,
  AgencyListItem,
} from "./types";

export const agencyKeys = {
  all: ["agencies"] as const,
  list: (query: AgenciesQuery) =>
    [...agencyKeys.all, "list", query] as const,
  detail: (recordId: string) =>
    [...agencyKeys.all, "detail", recordId] as const,
};

export const useAgencies = (
  query: AgenciesQuery,
): UseQueryResult<PaginatedResponse<AgencyListItem>, Error> =>
  useQuery<PaginatedResponse<AgencyListItem>>({
    queryKey: agencyKeys.list(query),
    queryFn: () => getAgencies(query),
    placeholderData: keepPreviousData,
  });

export const useAgency = (
  recordId: string | null,
): UseQueryResult<AgencyDetails, Error> =>
  useQuery<AgencyDetails>({
    queryKey: agencyKeys.detail(recordId ?? ""),
    queryFn: () => getAgency(recordId!),
    enabled: Boolean(recordId),
  });
