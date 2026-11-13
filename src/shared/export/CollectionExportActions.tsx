import React, { useState } from "react";
import { Clipboard, Download, Loader2, Menu } from "lucide-react";
import { copyJson, downloadJson } from "../../utils";
import { useToast } from "../toast/ToastProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
} from "../ui";

type ExportPayload = {
  count: number;
};

type CollectionExportActionsProps<TPayload extends ExportPayload> = {
  count: number;
  entityLabel: string;
  filenamePrefix: string;
  loadPayload: () => Promise<TPayload>;
};

type ExportAction = "copy" | "download";

const CollectionExportActions = <TPayload extends ExportPayload,>({
  count,
  entityLabel,
  filenamePrefix,
  loadPayload,
}: CollectionExportActionsProps<TPayload>) => {
  const toast = useToast();
  const [pendingAction, setPendingAction] = useState<ExportAction | null>(null);

  const runExport = async (action: ExportAction) => {
    setPendingAction(action);
    const toastId = toast.show(
      `Preparing ${count.toLocaleString()} ${entityLabel}...`,
      "loading",
    );

    try {
      const payload = await loadPayload();

      if (action === "copy") {
        await copyJson(payload);
      } else {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        downloadJson(payload, `${filenamePrefix}-${timestamp}.json`);
      }

      toast.update(
        toastId,
        action === "copy"
          ? `${payload.count.toLocaleString()} ${entityLabel} copied`
          : `${payload.count.toLocaleString()} ${entityLabel} downloaded`,
        "success",
      );
    } catch (error) {
      console.error(`${entityLabel} export failed`, error);
      toast.update(toastId, `Could not export ${entityLabel}`, "error");
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
          title={`Export ${entityLabel}`}
          aria-label={`Export ${entityLabel}`}
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
          <span>
            Copy all matching {entityLabel} ({count.toLocaleString()})
          </span>
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

export default CollectionExportActions;
