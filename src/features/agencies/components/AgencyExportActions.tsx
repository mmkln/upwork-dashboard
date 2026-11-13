import React from "react";
import { CollectionExportActions } from "../../../shared/export";
import { getAgenciesExport } from "../api";
import type { AgenciesExportQuery } from "../types";

type AgencyExportActionsProps = {
  query: AgenciesExportQuery;
  count: number;
};

const AgencyExportActions: React.FC<AgencyExportActionsProps> = ({
  query,
  count,
}) => (
  <CollectionExportActions
    count={count}
    entityLabel="agencies"
    filenamePrefix="agencies"
    loadPayload={() => getAgenciesExport(query)}
  />
);

export default AgencyExportActions;
