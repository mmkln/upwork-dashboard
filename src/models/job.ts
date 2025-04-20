// src/models/job.ts

export interface Job {
  id: string;
  title: string;
  description: string;
  averageRate?: number;
  clientRating?: number;
  skills?: string[];
  fixedPrice?: number;
  hourlyRates?: Record<string, number>;
  status?: string;
  source?: string;
  [key: string]: any; // додаткові поля
}
