// src/features/public/services.ts
import apiClient from '../../api';

export async function getPublicStats(): Promise<any> {
  const response = await apiClient.get('/public/stats');
  return response.data;
}
