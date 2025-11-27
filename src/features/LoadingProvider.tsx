import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  subscribeToRequestLoaders,
  getActiveRequestCount,
} from "./globalLoadingStore";

interface LoadingContextValue {
  activeRequests: number;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextValue>({
  activeRequests: 0,
  isLoading: false,
});

export const LoadingProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [activeRequests, setActiveRequests] = useState(
    getActiveRequestCount(),
  );

  useEffect(() => {
    const unsubscribe = subscribeToRequestLoaders(setActiveRequests);
    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      activeRequests,
      isLoading: activeRequests > 0,
    }),
    [activeRequests],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useGlobalLoading = () => useContext(LoadingContext);
