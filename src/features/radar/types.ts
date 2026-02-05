export type JobBudget =
  | { type: "fixed"; amount: number }
  | { type: "hourly"; min: number; max: number }
  | null;

export interface Job {
  id: string;
  title: string;
  url: string;
  created_at: string;
  proposals: number | null;
  is_payment_verified: boolean;
  total_spent: number | null;
  hire_rate: number | null;
  experience: "Entry" | "Intermediate" | "Expert" | null;
  country: string | null;
  budget: JobBudget;
  normalized_stack: string[];
}

export type RadarStatus = "active" | "paused" | "disabled";
export type RadarScheduleFrequency = "realtime" | "hourly" | "daily";

export interface RadarSchedule {
  frequency: RadarScheduleFrequency;
  hourOfDay?: number | null;
}

export interface RadarNotifications {
  email: { enabled: boolean; to?: string };
  plugin: { enabled: boolean; key?: string };
}

export interface RadarFilters {
  verifiedOnly: boolean;
  minSpent: number | null;
  minHireRate: number | null;
  maxProposals: number | null;
  maxAgeHours: number | null;
  expertiseLevels: Array<Job["experience"]>;
  countriesInclude: string[];
  countriesExclude: string[];
  includeTags: string[];
  excludeTags: string[];
  minBudget: number | null;
  hourlyMin: number | null;
  hourlyMax: number | null;
  hideApplied: boolean;
  minScore: number | null;
}

export interface RadarWeights {
  freshness: number;
  lowProposals: number;
  trust: number;
  hireRate: number;
  budget: number;
  expertise: number;
  geo: number;
  stack: number;
}

export interface Radar {
  id: string;
  name: string;
  status: RadarStatus;
  schedule: RadarSchedule;
  notifications: RadarNotifications;
  filters: RadarFilters;
  weights: RadarWeights;
  lastRunAt?: string | null;
  lastResultCount?: number | null;
}

export type ApplicationStatus =
  | "none"
  | "applied"
  | "shortlisted"
  | "interview"
  | "hired"
  | "declined";

export interface Application {
  jobId: string;
  status: ApplicationStatus;
  note?: string;
  proposalLink?: string;
  updatedAt: string;
}

export interface RadarMatchReason {
  key: keyof RadarWeights;
  weight: number;
  signal: number;
  points: number;
}

export interface RadarMatch {
  radarId: string;
  jobId: string;
  score: number;
  computedAt: string;
  reasons?: RadarMatchReason[];
}
