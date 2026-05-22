import { useEffect, useState } from "react";
import { MarketSignalsEmptyState } from "../features/marketSignals/components";
import { useCollections } from "../features";
import { fetchUpworkJobs } from "../services/apiService";

const MarketSignalsBoard = () => {
  const { collections } = useCollections();
  const [totalJobsCount, setTotalJobsCount] = useState(0);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadJobsCount = async () => {
      setIsLoadingJobs(true);
      try {
        const response = await fetchUpworkJobs({ page_size: 1 });
        if (!cancelled) {
          setTotalJobsCount(response.count);
        }
      } catch (error) {
        console.error("Unable to load jobs count for market research:", error);
        if (!cancelled) {
          setTotalJobsCount(0);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingJobs(false);
        }
      }
    };

    loadJobsCount();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MarketSignalsEmptyState
      collections={collections}
      isLoadingJobs={isLoadingJobs}
      totalJobsCount={totalJobsCount}
    />
  );
};

export default MarketSignalsBoard;
