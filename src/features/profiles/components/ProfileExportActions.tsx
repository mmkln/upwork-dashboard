import React, { useState } from "react";
import { Clipboard, Download, Loader2, Menu } from "lucide-react";
import { copyJson, downloadJson } from "../../../utils";
import { useToast } from "../../../shared/toast/ToastProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
} from "../../../shared/ui";
import { getProfilesExport } from "../api";
import type { ProfilesExportQuery } from "../types";

interface ProfileExportActionsProps {
  query: ProfilesExportQuery;
  count: number;
}

type ExportAction = "copy" | "download";

const ProfileExportActions: React.FC<ProfileExportActionsProps> = ({
  query,
  count,
}) => {
  const toast = useToast();
  const [pendingAction, setPendingAction] = useState<ExportAction | null>(null);

  const runExport = async (action: ExportAction) => {
    setPendingAction(action);
    const toastId = toast.show(
      `Preparing ${count.toLocaleString()} profiles...`,
      "loading",
    );

    try {
      const payload = await getProfilesExport(query);

      if (action === "copy") {
        await copyJson(payload);
      } else {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        downloadJson(payload, `profiles-${timestamp}.json`);
      }

      toast.update(
        toastId,
        action === "copy"
          ? `${payload.count.toLocaleString()} profiles copied`
          : `${payload.count.toLocaleString()} profiles downloaded`,
        "success",
      );
    } catch (error) {
      console.error("Profile export failed", error);
      toast.update(toastId, "Could not export profiles", "error");
    } finally {
      setPendingAction(null);
    }
  };

  const disabled = count === 0 || pendingAction !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          variant="outline"
          size="sm"
          disabled={disabled}
          title="Export profiles"
          aria-label="Export profiles"
        >
          {pendingAction ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-menu rounded-block p-item"
      >
        <DropdownMenuItem
          className="min-h-control-small gap-item px-control py-item"
          disabled={disabled}
          onSelect={() => void runExport("copy")}
        >
          <Clipboard className="h-4 w-4" />
          <span>Copy all matching profiles ({count.toLocaleString()})</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="min-h-control-small gap-item px-control py-item"
          disabled={disabled}
          onSelect={() => void runExport("download")}
        >
          <Download className="h-4 w-4" />
          <span>Download JSON ({count.toLocaleString()})</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileExportActions;
