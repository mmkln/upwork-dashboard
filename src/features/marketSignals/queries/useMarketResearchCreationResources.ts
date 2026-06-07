import { useCallback, useState } from "react";
import type { JobCollection } from "../../../models";
import { fetchJobCollections } from "../../../services";

export const useMarketResearchCreationResources = () => {
  const [collections, setCollections] = useState<JobCollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCollections = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError("");
    try {
      const nextCollections = await fetchJobCollections({ signal });
      if (signal?.aborted) return;
      setCollections(nextCollections);
    } catch {
      if (signal?.aborted) return;
      setError("Unable to load collections.");
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  // Provide a way for callers to pass a controller if they want cancellation
  const loadWithAbort = useCallback(() => {
    const controller = new AbortController();
    void loadCollections(controller.signal);
    return controller;
  }, [loadCollections]);

  return {
    collections,
    isLoading,
    error,
    loadCollections,
    loadWithAbort,
  };
};
