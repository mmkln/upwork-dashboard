export type AgencyNumericValue = number | string | null;

export interface AgencyOffice {
  location: string;
  local_time: string | null;
  is_primary: boolean;
}

export interface AgencyLanguage {
  language: string;
  proficiency: string | null;
}

export interface AgencyPersonPreview {
  name: string;
  profile_url: string;
}

export interface AgencyListItem {
  record_id: string;
  upwork_agency_id: string | null;
  name: string;
  profile_url: string;
  tagline: string | null;
  job_success: number | null;
  total_earned: AgencyNumericValue;
  total_earned_is_lower_bound: boolean;
  total_hours: number | null;
  total_jobs: number | null;
  updated_at: string;
}

export interface AgencyDetails extends AgencyListItem {
  overview: string | null;
  badges: string[];
  services: string[];
  skills: string[];
  featured_clients: string[];
  hourly_rate_min: AgencyNumericValue;
  hourly_rate_max: AgencyNumericValue;
  minimum_project_size: AgencyNumericValue;
  minimum_project_size_is_lower_bound: boolean;
  member_since: string | null;
  agency_size: string | null;
  year_founded: number | null;
  client_focus: string[];
  office_locations: AgencyOffice[];
  languages: AgencyLanguage[];
  business_managers: AgencyPersonPreview[];
  members: AgencyPersonPreview[];
  collections: number[];
  created_at: string;
}

export type AgencyOrdering =
  | "updated"
  | "created"
  | "name"
  | "success"
  | "earned";

export interface AgenciesQuery {
  page: number;
  page_size: number;
  search?: string;
  ordering: AgencyOrdering;
}

export type AgenciesExportQuery = Pick<
  AgenciesQuery,
  "search" | "ordering"
>;

export interface AgenciesExportPayload {
  version: number;
  exported_at: string;
  count: number;
  filters: {
    search: string;
    ordering: AgencyOrdering;
  };
  agencies: AgencyDetails[];
}
