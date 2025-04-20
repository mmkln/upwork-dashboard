import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../api';
import { Job as UpworkJob } from '../../../models/job';

export function useJobs() {
  return useQuery<UpworkJob[], Error>({
    queryKey: ['jobs'],
    queryFn: async () => {
      const response = await apiClient.get<UpworkJob[]>('/jobs/');
      return response.data;
    },
  });
}
