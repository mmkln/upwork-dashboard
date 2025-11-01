import axios from "axios";
import { AuthUser, JobCollection, UpworkJob } from "../models";
import { environment } from "../environments";

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

apiClient.interceptors.request.use((config) => {
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
});

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

// Функція для отримання всіх робіт
export const fetchUpworkJobs = async (): Promise<UpworkJob[]> => {
  const response = await apiClient.get<UpworkJob[]>("/jobs/");
  return response.data.map((job) => ({
    ...job,
    collections: job.collections ?? [],
  }));
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
