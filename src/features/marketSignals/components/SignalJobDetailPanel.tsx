import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FormField,
  NumberField,
  OverlayBody,
  OverlayFooter,
  OverlayHeader,
  ReadOnlyField,
  ScrollArea,
  Select,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  Textarea,
} from "../../../shared/ui";
import { getRelevanceTone } from "../model/filters";
import type {
  MarketSignalJob,
  MarketSignalOverride,
  RelevanceStatus,
} from "../types";

type SignalJobDetailPanelProps = {
  job: MarketSignalJob | null;
  onSaveOverride: (override: MarketSignalOverride) => void;
};

type FormState = {
  relevanceStatus: RelevanceStatus;
  requestCategory: string;
  clientType: string;
  niche: string;
  problem: string;
  exactClientLanguage: string;
  buyerNeed: string;
  budgetSignal: string;
  urgencySignal: string;
  requiredSkills: string;
  relatedTools: string;
  difficulty: number;
  speedToValue: number;
  marketSignalScore: number;
  patternGroup: string;
  notes: string;
};

const toList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const createFormState = (job: MarketSignalJob): FormState => ({
  relevanceStatus: job.relevanceStatus,
  requestCategory: job.requestCategory,
  clientType: job.clientType,
  niche: job.niche,
  problem: job.problem,
  exactClientLanguage: job.exactClientLanguage,
  buyerNeed: job.buyerNeed,
  budgetSignal: job.budgetSignal,
  urgencySignal: job.urgencySignal,
  requiredSkills: job.requiredSkills.join(", "),
  relatedTools: job.relatedTools.join(", "),
  difficulty: job.difficulty,
  speedToValue: job.speedToValue,
  marketSignalScore: job.marketSignalScore,
  patternGroup: job.patternGroup,
  notes: job.notes,
});

const SignalJobDetailPanel: React.FC<SignalJobDetailPanelProps> = ({
  job,
  onSaveOverride,
}) => {
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [formState, setFormState] = useState<FormState | null>(
    job ? createFormState(job) : null,
  );

  useEffect(() => {
    setFormState(job ? createFormState(job) : null);
    setIsCorrectionOpen(false);
  }, [job]);

  if (!job || !formState) {
    return (
      <Card className="p-card">
        <EmptyState
          title="Select a signal job"
          description="Open a job to review extracted fields and save manual corrections."
        />
      </Card>
    );
  }

  const patchForm = (patch: Partial<FormState>) => {
    setFormState((current) => (current ? { ...current, ...patch } : current));
  };

  const resetForm = () => {
    setFormState(createFormState(job));
  };

  const openCorrection = () => {
    resetForm();
    setIsCorrectionOpen(true);
  };

  const closeCorrection = () => {
    resetForm();
    setIsCorrectionOpen(false);
  };

  const handleCorrectionOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setIsCorrectionOpen(open);
  };

  const handleSave = () => {
    onSaveOverride({
      boardId: job.boardId,
      jobId: job.jobId,
      relevanceStatus: formState.relevanceStatus,
      requestCategory: formState.requestCategory,
      clientType: formState.clientType,
      niche: formState.niche,
      problem: formState.problem,
      exactClientLanguage: formState.exactClientLanguage,
      buyerNeed: formState.buyerNeed,
      budgetSignal: formState.budgetSignal,
      urgencySignal: formState.urgencySignal,
      requiredSkills: toList(formState.requiredSkills),
      relatedTools: toList(formState.relatedTools),
      difficulty: formState.difficulty,
      speedToValue: formState.speedToValue,
      marketSignalScore: formState.marketSignalScore,
      patternGroup: formState.patternGroup,
      notes: formState.notes,
      updatedAt: new Date().toISOString(),
    });
    setIsCorrectionOpen(false);
  };

  return (
    <>
      <Card className="p-card">
        <div className="flex flex-wrap items-start justify-between gap-control">
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-heading text-text-primary">
              {job.sourceJob.title}
            </h2>
            <p className="mt-micro text-body text-text-muted">
              {job.sourceJob.country || "Unknown country"} /{" "}
              {job.sourceJob.experience || "Unknown experience"}
            </p>
          </div>
          <Badge tone={getRelevanceTone(job.relevanceStatus)}>
            {job.relevanceStatus}
          </Badge>
        </div>

        <div className="mt-card grid grid-cols-1 gap-item">
          <ReadOnlyField label="Category" value={job.requestCategory} />
          <ReadOnlyField label="Client type" value={job.clientType} />
          <ReadOnlyField label="Buyer need" value={job.buyerNeed} />
          <ReadOnlyField label="Urgency" value={job.urgencySignal} />
          <ReadOnlyField
            label="Score"
            value={job.marketSignalScore.toFixed(1)}
          />
        </div>

        <div className="mt-card rounded-control bg-block-subtle p-control text-body text-text-secondary">
          <div className="flex items-center justify-between gap-control">
            <p className="text-ui text-text-primary">Automatic suggestion</p>
            {job.userCorrections ? (
              <Badge tone="warning">Corrected</Badge>
            ) : (
              <Badge tone="neutral">Auto</Badge>
            )}
          </div>
          <div className="mt-control grid grid-cols-1 gap-item">
            <ReadOnlyField label="Category" value={job.auto.requestCategory} />
            <ReadOnlyField label="Client type" value={job.auto.clientType} />
            <ReadOnlyField label="Buyer need" value={job.auto.buyerNeed} />
            <ReadOnlyField label="Urgency" value={job.auto.urgencySignal} />
            <ReadOnlyField
              label="Score"
              value={job.auto.marketSignalScore.toFixed(1)}
            />
          </div>
        </div>

        <div className="mt-card rounded-control bg-block-subtle p-control text-body text-text-secondary">
          <p className="text-ui text-text-primary">Relevance reason</p>
          <p className="mt-micro">{job.relevanceReason}</p>
          <p className="mt-item">
            Include: {job.matchedIncludeKeywords.join(", ") || "-"}
          </p>
          <p>Exclude: {job.matchedExcludeKeywords.join(", ") || "-"}</p>
        </div>

        <Button
          className="mt-card w-full"
          size="sm"
          onClick={openCorrection}
        >
          {job.userCorrections ? "Edit correction" : "Correct signal"}
        </Button>
      </Card>

      <Sheet
        open={isCorrectionOpen}
        onOpenChange={handleCorrectionOpenChange}
      >
        <SheetContent className="flex w-full max-w-viewport-safe flex-col gap-0 overflow-hidden p-0 sm:max-w-sheet-md">
          <OverlayHeader className="pr-spacious text-left">
            <SheetTitle className="line-clamp-2 text-heading text-text-primary">
              Correct signal
            </SheetTitle>
            <SheetDescription className="line-clamp-2 text-body text-text-secondary">
              {job.sourceJob.title}
            </SheetDescription>
          </OverlayHeader>

          <ScrollArea className="max-h-overlay-detail-body">
            <OverlayBody className="flex flex-col gap-control">
              <label className="flex flex-col gap-item">
                <span className="text-label text-text-muted">Relevance</span>
                <Select
                  value={formState.relevanceStatus}
                  onChange={(event) =>
                    patchForm({
                      relevanceStatus: event.target.value as RelevanceStatus,
                    })
                  }
                >
                  <option value="Relevant">Relevant</option>
                  <option value="Maybe Relevant">Maybe Relevant</option>
                  <option value="Irrelevant">Irrelevant</option>
                </Select>
              </label>

              <div className="grid grid-cols-1 gap-control md:grid-cols-2">
                <FormField
                  label="Category"
                  value={formState.requestCategory}
                  onValueChange={(value) =>
                    patchForm({ requestCategory: value })
                  }
                />
                <FormField
                  label="Client type"
                  value={formState.clientType}
                  onValueChange={(value) => patchForm({ clientType: value })}
                />
                <FormField
                  label="Niche"
                  value={formState.niche}
                  onValueChange={(value) => patchForm({ niche: value })}
                />
                <FormField
                  label="Buyer need"
                  value={formState.buyerNeed}
                  onValueChange={(value) => patchForm({ buyerNeed: value })}
                />
                <FormField
                  label="Budget"
                  value={formState.budgetSignal}
                  onValueChange={(value) => patchForm({ budgetSignal: value })}
                />
                <FormField
                  label="Urgency"
                  value={formState.urgencySignal}
                  onValueChange={(value) => patchForm({ urgencySignal: value })}
                />
              </div>

              <label className="flex flex-col gap-item">
                <span className="text-label text-text-muted">Problem</span>
                <Textarea
                  className="min-h-[82px]"
                  value={formState.problem}
                  onChange={(event) => patchForm({ problem: event.target.value })}
                />
              </label>

              <label className="flex flex-col gap-item">
                <span className="text-label text-text-muted">
                  Exact client language
                </span>
                <Textarea
                  className="min-h-[82px]"
                  value={formState.exactClientLanguage}
                  onChange={(event) =>
                    patchForm({ exactClientLanguage: event.target.value })
                  }
                />
              </label>

              <FormField
                label="Skills"
                value={formState.requiredSkills}
                onValueChange={(value) => patchForm({ requiredSkills: value })}
              />
              <FormField
                label="Tools"
                value={formState.relatedTools}
                onValueChange={(value) => patchForm({ relatedTools: value })}
              />
              <FormField
                label="Pattern group"
                value={formState.patternGroup}
                onValueChange={(value) => patchForm({ patternGroup: value })}
              />

              <div className="grid grid-cols-3 gap-control">
                <NumberField
                  label="Difficulty"
                  value={formState.difficulty}
                  min={1}
                  max={5}
                  onValueChange={(value) => patchForm({ difficulty: value })}
                />
                <NumberField
                  label="Speed"
                  value={formState.speedToValue}
                  min={1}
                  max={5}
                  onValueChange={(value) => patchForm({ speedToValue: value })}
                />
                <NumberField
                  label="Score"
                  value={formState.marketSignalScore}
                  min={1}
                  max={5}
                  step="0.1"
                  onValueChange={(value) =>
                    patchForm({ marketSignalScore: value })
                  }
                />
              </div>

              <label className="flex flex-col gap-item">
                <span className="text-label text-text-muted">Notes</span>
                <Textarea
                  className="min-h-[82px]"
                  value={formState.notes}
                  onChange={(event) => patchForm({ notes: event.target.value })}
                />
              </label>
            </OverlayBody>
          </ScrollArea>

          <OverlayFooter className="flex flex-col-reverse gap-item sm:flex-row sm:justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={closeCorrection}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save correction
            </Button>
          </OverlayFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default SignalJobDetailPanel;
