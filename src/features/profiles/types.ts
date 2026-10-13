export type ProfileNumericValue = number | string | null;

export interface ProfileListItem {
  id: string;
  name: string;
  title: string | null;
  profile_url: string | null;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  hourly_rate: ProfileNumericValue;
  job_success: number | null;
  total_earned: ProfileNumericValue;
  total_jobs: number | null;
  total_hours: number | null;
  skills: string[] | null;
  updated_at: string;
}

export interface ProfileProjectCatalogItem {
  id: string;
  title: string;
  price_from: number | null;
  delivery_days: number | null;
  url: string | null;
  thumbnail_url: string | null;
}

export interface ProfileWorkHistoryItem {
  status: "completed" | "in_progress";
  title: string;
  rating: number | null;
  period: string | null;
  feedback: string | null;
  endorsed_skills: string[];
}

export interface ProfileDetails extends ProfileListItem {
  upwork_uid: string | null;
  profile_type: "freelancer";
  overview: string | null;
  badges: string[] | null;
  project_catalog: ProfileProjectCatalogItem[];
  work_history: ProfileWorkHistoryItem[];
  created_at: string;
}

export type ProfileOrdering =
  | "updated"
  | "created"
  | "name"
  | "rate"
  | "success";

export interface ProfilesQuery {
  page: number;
  page_size: number;
  search?: string;
  country?: string;
  ordering: ProfileOrdering;
}

export type ProfilesExportQuery = Pick<
  ProfilesQuery,
  "search" | "country" | "ordering"
>;

export interface ProfilesExportPayload {
  version: number;
  exported_at: string;
  count: number;
  filters: {
    search: string;
    country: string;
    ordering: ProfileOrdering;
  };
  profiles: ProfileDetails[];
}
