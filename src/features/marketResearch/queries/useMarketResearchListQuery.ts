import { useQuery } from "@tanstack/react-query";
import { fetchMarketResearchList } from "../api/marketResearchApi";
import type { MarketResearch } from "../types";
import { marketResearchKeys } from "./keys";

/**
 * Clean data fetching hook using TanStack Query.
 *
 * Benefits:
 * - Automatic AbortSignal is passed to the queryFn (for cancellation on unmount/navigation).
 * - Proper isLoading / isFetching / error states.
 * - Shared cache across the app.
 */
export const useMarketResearchListQuery = () => {
  return useQuery<MarketResearch[]>({
    queryKey: marketResearchKeys.list(),
    queryFn: ({ signal }) => fetchMarketResearchList({ signal }),
    // Market research list is relatively stable
    staleTime: 2 * 60 * 1000,
  });
};
