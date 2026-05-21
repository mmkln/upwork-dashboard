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
} from "../../../shared/ui";
import { parseKeywordInput } from "../relevance";
import { buildMarketSignalJobs, getSignalSummary } from "../selectors";
import type { MarketSignalsBoardConfig } from "../types";

type BoardSettingsProps = {
  open: boolean;
  boards: MarketSignalsBoardConfig[];
  activeBoard: MarketSignalsBoardConfig;
  collections: JobCollection[];
  jobs: PreparedUpworkJob[];
  onOpenChange: (open: boolean) => void;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: () => void;
  onChangeBoard: (board: MarketSignalsBoardConfig) => void;
};

type PreviewState = {
  sourceJobs: number;
  likelyMatches: number;
  strongSignals: number;
  excludedByTerms: number;
  quality: "Add terms" | "Too narrow" | "Balanced" | "Too broad";
};

const suggestedTermGroups: Array<{ match: string[]; terms: string[] }> = [
  {
    match: ["gohighlevel", "go high level", "ghl"],
    terms: ["ghl", "crm", "pipeline", "workflow", "lead follow-up"],
  },
  {
    match: ["shopify", "ecommerce", "e-commerce"],
    terms: ["ecommerce", "product page", "checkout", "theme", "store setup"],
  },
  {
    match: ["ai automation", "openai", "chatgpt"],
    terms: ["openai", "zapier", "make", "workflow", "automation"],
  },
  {
    match: ["dashboard", "data", "reporting"],
    terms: ["analytics", "reporting", "looker", "google sheets", "dashboard"],
  },
];

const normalizeTerms = (terms: string[]) =>
  Array.from(
    new Set(
      terms
        .map((term) => term.trim().toLowerCase())
        .filter(Boolean),
    ),
  );

const getBoardLabel = (board: MarketSignalsBoardConfig) =>
  board.marketQuery || board.name || "Untitled research";

const getSuggestedTerms = (board: MarketSignalsBoardConfig) => {
  const query = board.marketQuery.toLowerCase();
  const queryTerms = parseKeywordInput(query.replace(/\s+/g, ","));
  const mappedTerms = suggestedTermGroups.flatMap((group) =>
    group.match.some((term) => query.includes(term)) ? group.terms : [],
  );
  const existingTerms = new Set([
    ...board.includeKeywords,
    ...board.excludeKeywords,
  ]);

  return normalizeTerms([...queryTerms, ...mappedTerms]).filter(
    (term) => !existingTerms.has(term),
  );
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
  const hasTerms = board.includeKeywords.length > 0;
  const quality = !hasTerms
    ? "Add terms"
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

  useEffect(() => {
    if (open) {
      setDraftBoard(activeBoard);
    }
  }, [activeBoard, open]);

  const selectedCollectionValue = useMemo(
    () => String(draftBoard.sourceCollectionId ?? "all"),
    [draftBoard.sourceCollectionId],
  );

  const suggestedTerms = useMemo(
    () => getSuggestedTerms(draftBoard),
    [draftBoard],
  );

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

  const setIncludeKeywords = (keywords: string[]) => {
    patchDraft({ includeKeywords: normalizeTerms(keywords) });
  };

  const setExcludeKeywords = (keywords: string[]) => {
    patchDraft({ excludeKeywords: normalizeTerms(keywords) });
  };

  const handleApply = () => {
    onChangeBoard({
      ...draftBoard,
      name: draftBoard.marketQuery || draftBoard.name,
      updatedAt: new Date().toISOString(),
    });
    onOpenChange(false);
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
            Tune what counts as a market signal before applying changes.
          </DialogDescription>
        </OverlayHeader>

        <ScrollArea className="max-h-overlay-body">
          <OverlayBody className="grid grid-cols-1 gap-card lg:grid-cols-settings">
            <div className="flex flex-col gap-card">
              <label className="flex flex-col gap-item">
                <span className="text-label text-text-muted">
                  What are you researching?
                </span>
                <Input
                  value={draftBoard.marketQuery}
                  placeholder="GoHighLevel automation for local businesses"
                  onChange={(event) =>
                    patchDraft({
                      marketQuery: event.target.value,
                      name: event.target.value || draftBoard.name,
                    })
                  }
                />
              </label>

              <label className="flex flex-col gap-item">
                <span className="text-label text-text-muted">Source</span>
                <Select
                  value={selectedCollectionValue}
                  onChange={(event) =>
                    patchDraft({
                      sourceCollectionId:
                        event.target.value === "all"
                          ? null
                          : Number(event.target.value),
                    })
                  }
                >
                  <option value="all">All collections</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </Select>
              </label>

              <KeywordEditor
                label="Must match"
                keywords={draftBoard.includeKeywords}
                placeholder="Add term"
                tone="success"
                onChange={setIncludeKeywords}
              />

              <SuggestedTerms
                terms={suggestedTerms}
                onAdd={(term) =>
                  setIncludeKeywords([...draftBoard.includeKeywords, term])
                }
              />

              <KeywordEditor
                label="Exclude"
                keywords={draftBoard.excludeKeywords}
                placeholder="Add term"
                tone="warning"
                onChange={setExcludeKeywords}
              />
            </div>

            <div className="flex flex-col gap-component">
              <div className="rounded-control bg-block-subtle p-component">
                <p className="text-ui text-text-primary">Preview</p>
                <div className="mt-component flex flex-col gap-control">
                  <PreviewRow label="Jobs in source" value={preview.sourceJobs} />
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
                  size="sm"
                  variant="soft"
                  onClick={onCreateBoard}
                >
                  New research
                </Button>
              </div>
            </div>
          </OverlayBody>
        </ScrollArea>

        <OverlayFooter className="flex flex-col-reverse gap-item sm:flex-row sm:justify-end">
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleApply}>
            Apply research
          </Button>
        </OverlayFooter>
      </DialogContent>
    </Dialog>
  );
};

type KeywordEditorProps = {
  label: string;
  keywords: string[];
  placeholder: string;
  tone: "success" | "warning";
  onChange: (keywords: string[]) => void;
};

const KeywordEditor: React.FC<KeywordEditorProps> = ({
  label,
  keywords,
  placeholder,
  tone,
  onChange,
}) => {
  const [draft, setDraft] = useState("");

  const addDraftTerms = () => {
    const nextTerms = parseKeywordInput(draft);
    if (!nextTerms.length) return;
    onChange([...keywords, ...nextTerms]);
    setDraft("");
  };

  const removeTerm = (term: string) => {
    onChange(keywords.filter((keyword) => keyword !== term));
  };

  return (
    <div className="flex flex-col gap-item">
      <span className="text-label text-text-muted">{label}</span>
      <div className="flex gap-item">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addDraftTerms();
            }
          }}
        />
        <Button size="sm" variant="soft" onClick={addDraftTerms}>
          Add
        </Button>
      </div>
      <div className="flex min-h-control-small flex-wrap gap-item">
        {keywords.length ? (
          keywords.map((keyword) => (
            <button
              key={keyword}
              type="button"
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
              onClick={() => removeTerm(keyword)}
            >
              <Badge tone={tone}>{keyword} x</Badge>
            </button>
          ))
        ) : (
          <span className="text-body text-text-muted">No terms</span>
        )}
      </div>
    </div>
  );
};

type SuggestedTermsProps = {
  terms: string[];
  onAdd: (term: string) => void;
};

const SuggestedTerms: React.FC<SuggestedTermsProps> = ({ terms, onAdd }) => {
  if (!terms.length) return null;

  return (
    <div className="flex flex-col gap-item">
      <span className="text-label text-text-muted">Suggested</span>
      <div className="flex flex-wrap gap-item">
        {terms.slice(0, 8).map((term) => (
          <button
            key={term}
            type="button"
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={() => onAdd(term)}
          >
            <Badge tone="info">{term} +</Badge>
          </button>
        ))}
      </div>
    </div>
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
