import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMarketResearchList } from "../api/marketResearchApi";
import type { MarketResearch } from "../types";

export const useMarketResearchList = () => {
  const [records, setRecords] = useState<MarketResearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);
    try {
      const nextRecords = await fetchMarketResearchList();
      if (!isMountedRef.current || requestId !== requestIdRef.current) return;
      setRecords(nextRecords);
      setError("");
    } catch {
      if (!isMountedRef.current || requestId !== requestIdRef.current) return;
      setError("Unable to load market research.");
    } finally {
      if (isMountedRef.current && requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    void load();

    return () => {
      isMountedRef.current = false;
    };
  }, [load]);

  const upsertRecord = useCallback((record: MarketResearch) => {
    setRecords((currentRecords) => {
      const existingRecord = currentRecords.find(
        (item) => item.id === record.id,
      );
      if (!existingRecord) {
        return [record, ...currentRecords];
      }
      return currentRecords.map((item) =>
        item.id === record.id ? record : item,
      );
    });
  }, []);

  return {
    records,
    isLoading,
    error,
    upsertRecord,
    refresh: load,
  };
};
