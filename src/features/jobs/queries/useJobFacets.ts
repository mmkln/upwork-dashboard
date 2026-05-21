import { useMemo } from "react";
import type { FilterState } from "../../filters/types";
import { buildJobFacets } from "../model/jobFacets";
import { useJobsSnapshot } from "./useJobsSnapshot";

type UseJobFacetsParams = {
  filters?: FilterState;
  pageSize?: number;
};

export const useJobFacets = ({
  filters,
  pageSize,
}: UseJobFacetsParams = {}) => {
  const snapshot = useJobsSnapshot({ filters, pageSize });
  const facets = useMemo(() => buildJobFacets(snapshot.jobs), [snapshot.jobs]);

  return {
    ...snapshot,
    facets,
  };
};
