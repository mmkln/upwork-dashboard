import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Select,
  Textarea,
} from "../../../shared/ui";
import { getRelevanceTone } from "../filters";
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
  const [formState, setFormState] = useState<FormState | null>(
    job ? createFormState(job) : null,
  );

  useEffect(() => {
    setFormState(job ? createFormState(job) : null);
  }, [job]);

  const scoreRows = useMemo(() => {
    if (!job) return [];
    return Object.entries(job.scoreBreakdown).map(([label, value]) => ({
      label,
      value,
    }));
  }, [job]);

  if (!job || !formState) {
    return (
      <Card className="p-5">
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
  };

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="line-clamp-2 text-base font-semibold text-text-primary">
            {job.sourceJob.title}
          </h2>
          <p className="mt-1 text-xs text-text-muted">
            {job.sourceJob.country || "Unknown country"} /{" "}
            {job.sourceJob.experience || "Unknown experience"}
          </p>
        </div>
        <Badge tone={getRelevanceTone(job.relevanceStatus)}>
          {job.relevanceStatus}
        </Badge>
      </div>

      <div className="mt-5 rounded-[10px] bg-surface-subtle p-3 text-xs text-text-secondary">
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium text-text-primary">Automatic suggestion</p>
          {job.userCorrections ? (
            <Badge tone="warning">Corrected</Badge>
          ) : (
            <Badge tone="neutral">Auto</Badge>
          )}
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2">
          <AutoValue label="Category" value={job.auto.requestCategory} />
          <AutoValue label="Client type" value={job.auto.clientType} />
          <AutoValue label="Buyer need" value={job.auto.buyerNeed} />
          <AutoValue label="Urgency" value={job.auto.urgencySignal} />
          <AutoValue
            label="Score"
            value={job.auto.marketSignalScore.toFixed(1)}
          />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
        {scoreRows.map((row) => (
          <div key={row.label} className="rounded-[8px] bg-surface-subtle p-3">
            <p className="truncate text-text-muted">{row.label}</p>
            <p className="mt-1 font-semibold text-text-primary">{row.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-muted">Relevance</span>
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-1">
          <Field
            label="Category"
            value={formState.requestCategory}
            onChange={(value) => patchForm({ requestCategory: value })}
          />
          <Field
            label="Client type"
            value={formState.clientType}
            onChange={(value) => patchForm({ clientType: value })}
          />
          <Field
            label="Niche"
            value={formState.niche}
            onChange={(value) => patchForm({ niche: value })}
          />
          <Field
            label="Buyer need"
            value={formState.buyerNeed}
            onChange={(value) => patchForm({ buyerNeed: value })}
          />
          <Field
            label="Budget"
            value={formState.budgetSignal}
            onChange={(value) => patchForm({ budgetSignal: value })}
          />
          <Field
            label="Urgency"
            value={formState.urgencySignal}
            onChange={(value) => patchForm({ urgencySignal: value })}
          />
        </div>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-muted">Problem</span>
          <Textarea
            className="min-h-[82px]"
            value={formState.problem}
            onChange={(event) => patchForm({ problem: event.target.value })}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-muted">
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
        <Field
          label="Skills"
          value={formState.requiredSkills}
          onChange={(value) => patchForm({ requiredSkills: value })}
        />
        <Field
          label="Tools"
          value={formState.relatedTools}
          onChange={(value) => patchForm({ relatedTools: value })}
        />
        <div className="grid grid-cols-3 gap-3">
          <NumberField
            label="Difficulty"
            value={formState.difficulty}
            onChange={(value) => patchForm({ difficulty: value })}
          />
          <NumberField
            label="Speed"
            value={formState.speedToValue}
            onChange={(value) => patchForm({ speedToValue: value })}
          />
          <NumberField
            label="Score"
            value={formState.marketSignalScore}
            step="0.1"
            onChange={(value) => patchForm({ marketSignalScore: value })}
          />
        </div>
        <label className="flex flex-col gap-2">
          <span className="text-xs font-medium text-text-muted">Notes</span>
          <Textarea
            className="min-h-[82px]"
            value={formState.notes}
            onChange={(event) => patchForm({ notes: event.target.value })}
          />
        </label>
        <div className="rounded-[10px] bg-surface-subtle p-3 text-xs text-text-secondary">
          <p className="font-medium text-text-primary">Relevance reason</p>
          <p className="mt-1">{job.relevanceReason}</p>
          <p className="mt-2">
            Include: {job.matchedIncludeKeywords.join(", ") || "-"}
          </p>
          <p>Exclude: {job.matchedExcludeKeywords.join(", ") || "-"}</p>
        </div>
        <Button size="sm" onClick={handleSave}>
          Save correction
        </Button>
      </div>
    </Card>
  );
};

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const Field: React.FC<FieldProps> = ({ label, value, onChange }) => (
  <label className="flex flex-col gap-2">
    <span className="text-xs font-medium text-text-muted">{label}</span>
    <Input value={value} onChange={(event) => onChange(event.target.value)} />
  </label>
);

type AutoValueProps = {
  label: string;
  value: string;
};

const AutoValue: React.FC<AutoValueProps> = ({ label, value }) => (
  <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-2">
    <span className="text-text-muted">{label}</span>
    <span className="truncate text-text-primary">{value || "-"}</span>
  </div>
);

type NumberFieldProps = {
  label: string;
  value: number;
  step?: string;
  onChange: (value: number) => void;
};

const NumberField: React.FC<NumberFieldProps> = ({
  label,
  value,
  step = "1",
  onChange,
}) => (
  <label className="flex flex-col gap-2">
    <span className="text-xs font-medium text-text-muted">{label}</span>
    <Input
      min={1}
      max={5}
      step={step}
      type="number"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  </label>
);

export default SignalJobDetailPanel;
