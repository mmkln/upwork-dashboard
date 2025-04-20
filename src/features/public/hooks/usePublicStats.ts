import { useQuery } from '@tanstack/react-query';
import { getPublicStats } from '../services';

export function usePublicStats() {
  return useQuery<any, Error>({
    queryKey: ['publicStats'],
    queryFn: getPublicStats,
  });
}
