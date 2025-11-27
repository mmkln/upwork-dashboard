import axios from "axios";
import {
  AuthUser,
  JobCollection,
  PaginatedResponse,
  PaginationParams,
  UpworkJob,
} from "../models";
import { environment } from "../environments";
import {
  decrementRequestLoaders,
  incrementRequestLoaders,
} from "../features/globalLoadingStore";

export const AUTH_STORAGE_KEY = "authToken";

export const getApiAuthToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(AUTH_STORAGE_KEY);
  } catch {
    return null;
  }
};

// Створюємо інстанс axios із базовим URL
const apiClient = axios.create({
  baseURL: environment.apiUrl, // Заміни на свій базовий URL
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    incrementRequestLoaders();
    const token = getApiAuthToken();
    if (token) {
      if (!config.headers) {
        config.headers = {} as any;
      }
      if (typeof (config.headers as any).set === "function") {
        (config.headers as any).set("Authorization", `Token ${token}`);
      } else {
        (config.headers as any).Authorization = `Token ${token}`;
      }
    }
    return config;
  },
  (error) => {
    decrementRequestLoaders();
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    decrementRequestLoaders();
    return response;
  },
  (error) => {
    decrementRequestLoaders();
    return Promise.reject(error);
  },
);

const buildJobPayload = (jobData: Partial<UpworkJob>) => {
  const payload: Record<string, unknown> = { ...jobData };
  if (payload.collections && Array.isArray(payload.collections)) {
    payload.collection_ids = Array.from(
      new Set(
        payload.collections
          .map((value) => Number(value))
          .filter((value) => !Number.isNaN(value)),
      ),
    );
  }
  delete payload.collections;
  if (Array.isArray(payload.collection_ids)) {
    payload.collection_ids = Array.from(
      new Set(
        payload.collection_ids
          .map((value) => Number(value))
          .filter((value) => !Number.isNaN(value)),
      ),
    );
  }
  return payload;
};

interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const login = async (
  credentials: { username: string; password: string },
): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(
    "/auth/login/",
    credentials,
  );
  return response.data;
};

export interface JobQueryParams extends PaginationParams {
  search?: string;
  job_type?: "fixed" | "hourly" | "unspecified";
  fixed_price_min?: number;
  fixed_price_max?: number;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  skills?: string;
  instruments?: string;
  statuses?: string;
  collections?: string;
  experience?: string;
  bookmarked?: boolean;
}

const normalizeJob = (job: UpworkJob): UpworkJob => ({
  ...job,
  collections: job.collections ?? [],
});

const normalizeUpworkJobsResponse = (
  data: PaginatedResponse<UpworkJob> | UpworkJob[],
): PaginatedResponse<UpworkJob> => {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data.map(normalizeJob),
    };
  }
  return {
    ...data,
    results: data.results.map(normalizeJob),
  };
};

// Функція для отримання робіт із пагінацією
export const fetchUpworkJobs = async (
  params?: JobQueryParams,
): Promise<PaginatedResponse<UpworkJob>> => {
  const response = await apiClient.get<
    PaginatedResponse<UpworkJob> | UpworkJob[]
  >("/jobs/", {
    params,
  });

  return normalizeUpworkJobsResponse(response.data);
};

export const fetchAllUpworkJobs = async (
  pageSize = 2000,
): Promise<UpworkJob[]> => {
  let page = 1;
  let hasNext = true;
  const jobs: UpworkJob[] = [];

  while (hasNext) {
    const { results, next } = await fetchUpworkJobs({
      page,
      page_size: pageSize,
    });
    jobs.push(...results);
    if (next) {
      page += 1;
    } else {
      hasNext = false;
    }
  }

  return jobs;
};

export const createUpworkJob = async (
  jobData: Partial<UpworkJob>,
): Promise<UpworkJob> => {
  const response = await apiClient.post<UpworkJob>(
    "/jobs/",
    buildJobPayload(jobData),
  );
  return response.data;
};

export const updateUpworkJob = async (
  jobData: Partial<UpworkJob>,
): Promise<UpworkJob> => {
  const response = await apiClient.patch<UpworkJob>(
    `/jobs/${jobData.id}/`,
    buildJobPayload(jobData),
  );
  return response.data;
};

export const fetchJobCollections = async (): Promise<JobCollection[]> => {
  try {
    const response = await apiClient.get<JobCollection[]>("/collections/");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.warn("Unauthorized to fetch collections; returning empty list.");
      return [];
    }
    throw error;
  }
};

export const setApiAuthToken = (token: string | null) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (token) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.warn("Unable to update auth token in storage", error);
  }
};
