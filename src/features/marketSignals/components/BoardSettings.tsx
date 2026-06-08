import React, { useEffect, useMemo, useState } from "react";
import type { JobCollection, PreparedUpworkJob } from "../../../models";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  OverlayBody,
  OverlayFooter,
  OverlayHeader,
  ScrollArea,
  Select,
  Textarea,
} from "../../../shared/ui";
import { buildMarketSignalJobs, getSignalSummary } from "../model/selectors";
import type { MarketSignalsBoardConfig } from "../types";

type BoardSettingsProps = {
  open: boolean;
  boards: MarketSignalsBoardConfig[];
  activeBoard: MarketSignalsBoardConfig;
  collections: JobCollection[];
  jobs: PreparedUpworkJob[];
  onOpenChange: (open: boolean) => void;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: () => void | Promise<void>;
  onChangeBoard: (board: MarketSignalsBoardConfig) => void | Promise<void>;
};

type PreviewState = {
  sourceJobs: number;
  likelyMatches: number;
  strongSignals: number;
  excludedByTerms: number;
  quality: "No jobs" | "Too narrow" | "Balanced" | "Too broad";
};

const SNAPSHOT_CURRENT_VALUE = "snapshot";
const SNAPSHOT_ALL_VALUE = "all";

const getBoardLabel = (board: MarketSignalsBoardConfig) =>
  board.marketQuery || board.name || "Untitled research";

const getJobIdsForSnapshotSource = (
  value: string,
  jobs: PreparedUpworkJob[],
): string[] => {
  if (value === SNAPSHOT_ALL_VALUE) {
    return jobs.map((job) => job.id);
  }
  const collectionId = Number(value);
  if (Number.isNaN(collectionId)) {
    return [];
  }
  return jobs
    .filter((job) => job.collectionsSet.has(collectionId))
    .map((job) => job.id);
};

const buildPreview = (
  jobs: PreparedUpworkJob[],
  board: MarketSignalsBoardConfig,
): PreviewState => {
  const signalJobs = buildMarketSignalJobs(jobs, board, []);
  const summary = getSignalSummary(signalJobs);
  const likelyMatches = summary.relevantJobs + summary.maybeRelevantJobs;
  const excludedByTerms = signalJobs.filter(
    (job) => job.matchedExcludeKeywords.length > 0,
  ).length;
  const matchRatio = summary.totalJobs ? likelyMatches / summary.totalJobs : 0;
  const quality =
    summary.totalJobs === 0
      ? "No jobs"
      : likelyMatches < 10
        ? "Too narrow"
        : matchRatio > 0.5 || likelyMatches > 300
          ? "Too broad"
          : "Balanced";

  return {
    sourceJobs: summary.totalJobs,
    likelyMatches,
    strongSignals: summary.strongSignals,
    excludedByTerms,
    quality,
  };
};

const BoardSettings: React.FC<BoardSettingsProps> = ({
  open,
  boards,
  activeBoard,
  collections,
  jobs,
  onOpenChange,
  onSelectBoard,
  onCreateBoard,
  onChangeBoard,
}) => {
  const [draftBoard, setDraftBoard] = useState(activeBoard);
  const [snapshotSource, setSnapshotSource] = useState(SNAPSHOT_CURRENT_VALUE);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (open) {
      setDraftBoard(activeBoard);
      setSnapshotSource(SNAPSHOT_CURRENT_VALUE);
      setSaveError("");
    }
  }, [activeBoard, open]);

  const preview = useMemo(
    () => buildPreview(jobs, draftBoard),
    [draftBoard, jobs],
  );

  const patchDraft = (patch: Partial<MarketSignalsBoardConfig>) => {
    setDraftBoard((current) => ({
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSnapshotSourceChange = (value: string) => {
    setSnapshotSource(value);
    if (value === SNAPSHOT_CURRENT_VALUE) return;
    patchDraft({
      jobsSnapshot: getJobIdsForSnapshotSource(value, jobs),
    });
  };

  const handleApply = async () => {
    setIsSaving(true);
    setSaveError("");
    try {
      await onChangeBoard({
        ...draftBoard,
        name: draftBoard.marketQuery || draftBoard.name,
        updatedAt: new Date().toISOString(),
      });
      onOpenChange(false);
    } catch {
      setSaveError("Unable to save market research.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async () => {
    setIsSaving(true);
    setSaveError("");
    try {
      await onCreateBoard();
      setSnapshotSource(SNAPSHOT_CURRENT_VALUE);
    } catch {
      setSaveError("Unable to create market research.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDraftBoard(activeBoard);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-overlay max-w-modal-lg gap-0 overflow-hidden p-0">
        <OverlayHeader className="text-center sm:text-left">
          <DialogTitle className="text-heading text-text-primary">
            Refine research
          </DialogTitle>
          <DialogDescription className="text-body text-text-secondary">
            Save a named job snapshot for market signal analysis.
          </DialogDescription>
        </OverlayHeader>

        <ScrollArea className="max-h-overlay-body">
          <OverlayBody className="grid grid-cols-1 gap-card lg:grid-cols-settings">
            <div className="flex flex-col gap-card">
              <label className="flex flex-col gap-item">
                <span className="text-label text-text-muted">Title</span>
                <Input
                  value={draftBoard.marketQuery}
                  placeholder="GHL automation research"
                  onChange={(event) =>
                    patchDraft({
                      marketQuery: event.target.value,
                      name: event.target.value || draftBoard.name,
                    })
                  }
                />
              </label>

              <label className="flex flex-col gap-item">
                <span className="text-label text-text-muted">Description</span>
                <Textarea
                  value={draftBoard.goal}
                  placeholder="Research selected GHL jobs"
                  onChange={(event) =>
                    patchDraft({
                      goal: event.target.value,
                    })
                  }
                />
              </label>

              <label className="flex flex-col gap-item">
                <span className="text-label text-text-muted">
                  Snapshot source
                </span>
                <Select
                  value={snapshotSource}
                  onChange={(event) =>
                    handleSnapshotSourceChange(event.target.value)
                  }
                >
                  <option value={SNAPSHOT_CURRENT_VALUE}>
                    Current saved snapshot
                  </option>
                  <option value={SNAPSHOT_ALL_VALUE}>All loaded jobs</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </Select>
              </label>

              <div className="flex flex-col gap-item">
                <span className="text-label text-text-muted">
                  Jobs snapshot
                </span>
                <p className="text-body text-text-secondary">
                  {draftBoard.jobsSnapshot.length.toLocaleString()} job IDs will
                  be saved with this research.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-component">
              <div className="rounded-control bg-block-subtle p-component">
                <p className="text-ui text-text-primary">Preview</p>
                <div className="mt-component flex flex-col gap-control">
                  <PreviewRow label="Jobs in snapshot" value={preview.sourceJobs} />
                  <PreviewRow
                    label="Likely matches"
                    value={preview.likelyMatches}
                  />
                  <PreviewRow
                    label="Strong signals"
                    value={preview.strongSignals}
                  />
                  <PreviewRow
                    label="Excluded"
                    value={preview.excludedByTerms}
                  />
                </div>
                <div className="mt-component">
                  <Badge
                    tone={preview.quality === "Balanced" ? "success" : "warning"}
                  >
                    {preview.quality}
                  </Badge>
                </div>
              </div>

              <div className="rounded-control bg-block-subtle p-component">
                <label className="flex flex-col gap-item">
                  <span className="text-label text-text-muted">
                    Saved research
                  </span>
                  <Select
                    value={activeBoard.id}
                    onChange={(event) => onSelectBoard(event.target.value)}
                  >
                    {boards.map((board) => (
                      <option key={board.id} value={board.id}>
                        {getBoardLabel(board)}
                      </option>
                    ))}
                  </Select>
                </label>
                <Button
                  className="mt-control w-full"
                  disabled={isSaving}
                  size="sm"
                  variant="soft"
                  onClick={handleCreate}
                >
                  New research
                </Button>
              </div>

              {saveError ? (
                <p className="text-body text-destructive">{saveError}</p>
              ) : null}
            </div>
          </OverlayBody>
        </ScrollArea>

        <OverlayFooter className="flex flex-col-reverse gap-item sm:flex-row sm:justify-end">
          <Button
            disabled={isSaving}
            size="sm"
            variant="ghost"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button disabled={isSaving} size="sm" onClick={handleApply}>
            {isSaving ? "Saving" : "Apply research"}
          </Button>
        </OverlayFooter>
      </DialogContent>
    </Dialog>
  );
};

type PreviewRowProps = {
  label: string;
  value: number;
};

const PreviewRow: React.FC<PreviewRowProps> = ({ label, value }) => (
  <div className="flex items-center justify-between gap-control text-body">
    <span className="text-text-muted">{label}</span>
    <span className="text-ui text-text-primary">{value.toLocaleString()}</span>
  </div>
);

export default BoardSettings;
