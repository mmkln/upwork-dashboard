import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { JobCollection } from "../../models";
import { fetchJobCollections } from "../../services";

type CollectionsContextValue = {
  collections: JobCollection[];
  setCollections: React.Dispatch<React.SetStateAction<JobCollection[]>>;
  refreshCollections: () => Promise<void>;
};

const CollectionsContext = createContext<CollectionsContextValue | undefined>(
  undefined,
);

export const CollectionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [collections, setCollections] = useState<JobCollection[]>([]);

  const refreshCollections = useCallback(async () => {
    try {
      const data = await fetchJobCollections();
      setCollections(data);
    } catch (error) {
      console.warn("Failed to fetch collections", error);
    }
  }, []);

  useEffect(() => {
    refreshCollections();
  }, [refreshCollections]);

  const value = useMemo(
    () => ({
      collections,
      setCollections,
      refreshCollections,
    }),
    [collections, refreshCollections],
  );

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
};

export const useCollections = (): CollectionsContextValue => {
  const ctx = useContext(CollectionsContext);
  if (!ctx) {
    throw new Error("useCollections must be used within CollectionsProvider");
  }
  return ctx;
};
