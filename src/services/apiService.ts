import axios from "axios";
import { UpworkJob } from "../models";

// Створюємо інстанс axios із базовим URL
const apiClient = axios.create({
  baseURL: "http://localhost:8080/api", // Заміни на свій базовий URL
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
