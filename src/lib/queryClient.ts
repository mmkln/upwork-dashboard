import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reasonable defaults for this Upwork analytics dashboard
      retry: 1,
      refetchOnWindowFocus: false,
      // Jobs data and market research don't change every second.
      // Snapshots are expensive (2000+ records), so keep them longer.
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000,   // 30 minutes (formerly cacheTime)
    },
  },
});
