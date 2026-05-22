import { useCallback, useEffect, useRef, useState } from "react";
import type { JobCollection } from "../../../models";
import { fetchJobCollections } from "../../../services";

export const useMarketResearchCreationResources = () => {
  const [collections, setCollections] = useState<JobCollection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadCollections = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);
    setError("");
    try {
      const nextCollections = await fetchJobCollections();
      if (!isMountedRef.current || requestId !== requestIdRef.current) return;
      setCollections(nextCollections);
    } catch {
      if (!isMountedRef.current || requestId !== requestIdRef.current) return;
      setError("Unable to load collections.");
    } finally {
      if (isMountedRef.current && requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  return {
    collections,
    isLoading,
    error,
    loadCollections,
  };
};
