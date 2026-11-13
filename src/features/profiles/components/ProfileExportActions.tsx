import React from "react";
import { CollectionExportActions } from "../../../shared/export";
import { getProfilesExport } from "../api";
import type { ProfilesExportQuery } from "../types";

interface ProfileExportActionsProps {
  query: ProfilesExportQuery;
  count: number;
}

const ProfileExportActions: React.FC<ProfileExportActionsProps> = ({
  query,
  count,
}) => (
  <CollectionExportActions
    count={count}
    entityLabel="profiles"
    filenamePrefix="profiles"
    loadPayload={() => getProfilesExport(query)}
  />
);

export default ProfileExportActions;
