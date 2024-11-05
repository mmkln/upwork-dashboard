import axios from "axios";
import { UpworkJob } from "../models";
import { environment } from "../environments";

// Створюємо інстанс axios із базовим URL
const apiClient = axios.create({
  baseURL: environment.apiUrl, // Заміни на свій базовий URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Функція для отримання всіх робіт
export const fetchUpworkJobs = async (): Promise<UpworkJob[]> => {
  const response = await apiClient.get<UpworkJob[]>("/jobs/");
  return response.data;
};

export const createUpworkJob = async (
  jobData: Partial<UpworkJob>,
): Promise<UpworkJob> => {
  const response = await apiClient.post<UpworkJob>("/jobs/", jobData);
  return response.data;
};
