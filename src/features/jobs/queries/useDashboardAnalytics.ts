import { useMemo } from "react";
import type { FilterState } from "../../filters/types";
import { buildDashboardAnalytics } from "../model/dashboardAnalytics";
import { useJobsSnapshot } from "./useJobsSnapshot";

type UseDashboardAnalyticsParams = {
  filters: FilterState;
  pageSize?: number;
};

export const useDashboardAnalytics = ({
  filters,
  pageSize,
}: UseDashboardAnalyticsParams) => {
  const snapshot = useJobsSnapshot({ filters, pageSize });
  const analytics = useMemo(
    () => buildDashboardAnalytics(snapshot.jobs, filters),
    [filters, snapshot.jobs],
  );

  return {
    ...snapshot,
    ...analytics,
  };
};
