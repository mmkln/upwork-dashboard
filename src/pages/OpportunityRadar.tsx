
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  ContentToolbar,
  EmptyState,
  FormField,
  Input,
  NumberField,
  OverlayBody,
  OverlayFooter,
  OverlayHeader,
  PageHeader,
  PageShell,
  ScrollArea,
  Select,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  Textarea,
} from "../shared/ui";
import { PlusIcon } from "../shared/icons";
import {
  DEFAULT_FILTERS,
  DEFAULT_WEIGHTS,
  seedApplications,
  seedJobs,
  seedRadars,
} from "../features/radar/seed";
import {
  loadApplications,
  loadMatches,
  loadRadars,
  saveApplications,
  saveMatches,
  saveRadars,
} from "../features/radar/storage";
import type {
  Application,
  ApplicationStatus,
  Radar,
  RadarFilters,
  RadarMatch,
  RadarWeights,
} from "../features/radar/types";
import {
  computeScore,
  formatAge,
  getApplicationByJobId,
  passesFilters,
} from "../features/radar/utils";

type EditorTabKey = "filters" | "weights" | "preview";
type SortKey = "score_desc" | "age_asc";

const EDITOR_TABS: Array<{ value: EditorTabKey; label: string }> = [
  { value: "filters", label: "Filters" },
  { value: "weights", label: "Weights" },
  { value: "preview", label: "Preview" },
];

const FieldError: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-body text-destructive">{children}</p>
);

const OpportunityRadar: React.FC = () => {
  const [radars, setRadars] = useState<Radar[]>(loadRadars());
  const [applications, setApplications] = useState<Application[]>(
    loadApplications(),
  );
  const [matchesByRadar, setMatchesByRadar] = useState<
    Record<string, RadarMatch[]>
  >(loadMatches());
  const [activeRadarId, setActiveRadarId] = useState<string | null>(
    radars[0]?.id ?? null,
  );
  const [editorRadar, setEditorRadar] = useState<Radar | null>(null);
  const [editorTab, setEditorTab] = useState<EditorTabKey>("filters");
  const [editorErrors, setEditorErrors] = useState<Record<string, string>>({});
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [matchesSearch, setMatchesSearch] = useState("");
  const [matchesSort, setMatchesSort] = useState<SortKey>("score_desc");
  const [matchesHideApplied, setMatchesHideApplied] = useState(false);
  const [matchesMinScore, setMatchesMinScore] = useState(0);
  const [inspectorJobId, setInspectorJobId] = useState<string | null>(null);
  const [inspectorUrlError, setInspectorUrlError] = useState("");
  const [toasts, setToasts] = useState<Array<{ id: string; message: string }>>(
    [],
  );
  const initRef = useRef(false);

  const jobs = seedJobs;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.localStorage.getItem("radars")) {
      saveRadars(seedRadars);
      saveApplications(seedApplications);
      saveMatches({});
    }
  }, []);

  useEffect(() => {
    saveRadars(radars);
  }, [radars]);

  useEffect(() => {
    saveApplications(applications);
  }, [applications]);

  useEffect(() => {
    saveMatches(matchesByRadar);
  }, [matchesByRadar]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const hasMatches = Object.keys(matchesByRadar).length > 0;
    if (!hasMatches) {
      const nextMatches: Record<string, RadarMatch[]> = {};
      const nextRadars = radars.map((radar) => {
        if (radar.status !== "active") return radar;
        const matches = buildMatches(radar);
        nextMatches[radar.id] = matches;
        return {
          ...radar,
          lastRunAt: new Date().toISOString(),
          lastResultCount: matches.length,
        };
      });
      setMatchesByRadar(nextMatches);
      setRadars(nextRadars);
    }
  }, [matchesByRadar, radars]);

  const activeRadar = useMemo(
    () => radars.find((radar) => radar.id === activeRadarId) || null,
    [radars, activeRadarId],
  );

  useEffect(() => {
    if (radars.length === 0) {
      setActiveRadarId(null);
      return;
    }
    if (!activeRadarId || !radars.some((radar) => radar.id === activeRadarId)) {
      setActiveRadarId(radars[0].id);
    }
  }, [activeRadarId, radars]);

  const activeMatches = useMemo(() => {
    if (!activeRadarId) return [];
    return matchesByRadar[activeRadarId] || [];
  }, [activeRadarId, matchesByRadar]);

  const filteredMatches = useMemo(() => {
    let list = [...activeMatches];
    const search = matchesSearch.trim().toLowerCase();
    if (search) {
      list = list.filter((match) => {
        const job = jobs.find((item) => item.id === match.jobId);
        return job ? job.title.toLowerCase().includes(search) : false;
      });
    }
    if (matchesHideApplied) {
      list = list.filter((match) => {
        const application = getApplicationByJobId(
          applications,
          match.jobId,
        );
        return application.status === "none";
      });
    }
    if (matchesMinScore > 0) {
      list = list.filter((match) => match.score >= matchesMinScore);
    }
    if (matchesSort === "score_desc") {
      list.sort((a, b) => b.score - a.score);
    } else if (matchesSort === "age_asc") {
      list.sort((a, b) => {
        const jobA = jobs.find((item) => item.id === a.jobId);
        const jobB = jobs.find((item) => item.id === b.jobId);
        if (!jobA || !jobB) return 0;
        return (
          new Date(jobA.created_at).getTime() -
          new Date(jobB.created_at).getTime()
        );
      });
    }
    return list;
  }, [
    activeMatches,
    applications,
    jobs,
    matchesHideApplied,
    matchesMinScore,
    matchesSearch,
    matchesSort,
  ]);

  const inspectorJob = useMemo(() => {
    if (!inspectorJobId) return null;
    return jobs.find((job) => job.id === inspectorJobId) || null;
  }, [inspectorJobId, jobs]);

  const inspectorMatch = useMemo(() => {
    if (!inspectorJobId) return null;
    return activeMatches.find((match) => match.jobId === inspectorJobId) || null;
  }, [activeMatches, inspectorJobId]);

  const showToast = (message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 2400);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditorRadar(null);
    setEditorErrors({});
  };

  const updateApplications = (next: Application[]) => {
    setApplications(next);
    showToast("Applied status updated");
  };

  const buildMatches = (radar: Radar) => {
    return jobs
      .filter((job) => passesFilters(job, radar.filters, applications))
      .map((job) => {
        const { score, reasons } = computeScore(job, radar);
        return {
          radarId: radar.id,
          jobId: job.id,
          score,
          computedAt: new Date().toISOString(),
          reasons,
        };
      })
      .filter((match) => {
        if (radar.filters.minScore == null) return true;
        return match.score >= radar.filters.minScore;
      })
      .sort((a, b) => b.score - a.score);
  };

  const handleCreateRadar = () => {
    const newRadar: Radar = {
      id: `radar-${Math.random().toString(36).slice(2, 9)}`,
      name: "New Radar",
      status: "paused",
      schedule: { frequency: "daily", hourOfDay: 9 },
      notifications: {
        email: { enabled: false, to: "" },
        plugin: { enabled: false, key: "" },
      },
      filters: JSON.parse(JSON.stringify(DEFAULT_FILTERS)),
      weights: { ...DEFAULT_WEIGHTS },
      lastRunAt: null,
      lastResultCount: null,
    };
    setEditorRadar(JSON.parse(JSON.stringify(newRadar)));
    setEditorTab("filters");
    setEditorErrors({});
    setIsEditorOpen(true);
    setInspectorJobId(null);
  };

  const handleEditRadar = (radar: Radar) => {
    setActiveRadarId(radar.id);
    setEditorRadar(JSON.parse(JSON.stringify(radar)));
    setEditorTab("filters");
    setEditorErrors({});
    setIsEditorOpen(true);
    setInspectorJobId(null);
  };

  const handleCloneRadar = (radar: Radar) => {
    const cloned: Radar = {
      ...JSON.parse(JSON.stringify(radar)),
      id: `radar-${Math.random().toString(36).slice(2, 9)}`,
      name: `${radar.name} Copy`,
      lastRunAt: null,
      lastResultCount: null,
    };
    setRadars((prev) => [cloned, ...prev]);
    showToast("Cloned");
  };

  const handleDeleteRadar = (radarId: string) => {
    setRadars((prev) => prev.filter((radar) => radar.id !== radarId));
    setMatchesByRadar((prev) => {
      const next = { ...prev };
      delete next[radarId];
      return next;
    });
    if (activeRadarId === radarId) {
      setActiveRadarId(radars[0]?.id ?? null);
    }
    showToast("Deleted");
  };

  const handleToggleStatus = (radar: Radar) => {
    const nextStatus =
      radar.status === "active"
        ? "paused"
        : radar.status === "paused"
        ? "active"
        : "active";
    setRadars((prev) =>
      prev.map((item) =>
        item.id === radar.id ? { ...item, status: nextStatus } : item,
      ),
    );
  };

  const handleDisable = (radar: Radar) => {
    setRadars((prev) =>
      prev.map((item) =>
        item.id === radar.id ? { ...item, status: "disabled" } : item,
      ),
    );
  };

  const handleExportRadar = async (radar: Radar) => {
    const payload = JSON.stringify(radar, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      showToast("Copied");
    } catch (error) {
      showToast("Clipboard blocked");
    }
  };

  const handleSaveRadar = () => {
    if (!editorRadar) return;
    const errors = validateRadar(editorRadar);
    setEditorErrors(errors);
    if (Object.keys(errors).length > 0) {
      showToast("Validation errors");
      return;
    }
    const matches = buildMatches(editorRadar);
    setMatchesByRadar((prev) => ({ ...prev, [editorRadar.id]: matches }));
    setRadars((prev) =>
      prev.some((radar) => radar.id === editorRadar.id)
        ? prev.map((radar) =>
            radar.id === editorRadar.id
              ? {
                  ...editorRadar,
                  lastRunAt: new Date().toISOString(),
                  lastResultCount: matches.length,
                }
              : radar,
          )
        : [
            {
              ...editorRadar,
              lastRunAt: new Date().toISOString(),
              lastResultCount: matches.length,
            },
            ...prev,
          ],
    );
    setActiveRadarId(editorRadar.id);
    showToast("Saved");
    closeEditor();
  };

  const updateEditorField = (path: string, value: unknown) => {
    if (!editorRadar) return;
    const nextRadar = JSON.parse(JSON.stringify(editorRadar)) as Radar;
    const keys = path.split(".");
    let cursor: any = nextRadar;
    while (keys.length > 1) {
      const key = keys.shift() as string;
      cursor = cursor[key];
    }
    cursor[keys[0] as string] = value;
    setEditorRadar(nextRadar);
  };

  const handleEditorInput = (path: string, value: unknown) => {
    if (Array.isArray(value)) {
      updateEditorField(path, value);
      return;
    }
    const numericFilterKeys = new Set([
      "minSpent",
      "minHireRate",
      "maxProposals",
      "maxAgeHours",
      "minBudget",
      "hourlyMin",
      "hourlyMax",
    ]);

    if (path.startsWith("filters.")) {
      const key = path.split(".")[1] as keyof RadarFilters;
      if (
        key === "countriesInclude" ||
        key === "countriesExclude" ||
        key === "includeTags" ||
        key === "excludeTags"
      ) {
        const items = String(value)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        if (key === "includeTags" || key === "excludeTags") {
          updateEditorField(path, items.map((item) => item.toLowerCase()));
        } else {
          updateEditorField(path, items);
        }
        return;
      }
      if (typeof value === "string" && numericFilterKeys.has(key)) {
        const trimmed = value.trim();
        updateEditorField(path, trimmed === "" ? null : Number(trimmed));
        return;
      }
      if (typeof value === "number" && Number.isNaN(value)) {
        updateEditorField(path, null);
        return;
      }
    }

    if (path === "schedule.hourOfDay" && typeof value === "string") {
      const trimmed = value.trim();
      updateEditorField(path, trimmed === "" ? null : Number(trimmed));
      return;
    }

    if (path === "schedule.hourOfDay" && typeof value === "number") {
      updateEditorField(path, Number.isNaN(value) ? null : value);
      return;
    }

    if (path.startsWith("weights.") && typeof value === "string") {
      const numberValue = Number(value);
      updateEditorField(path, Number.isNaN(numberValue) ? 0 : numberValue);
      return;
    }

    if (path.startsWith("weights.") && typeof value === "number") {
      updateEditorField(path, Number.isNaN(value) ? 0 : value);
      return;
    }

    updateEditorField(path, value);
  };

  const handleUpdateApplication = (jobId: string, updates: Partial<Application>) => {
    const existing = getApplicationByJobId(applications, jobId);
    const next: Application = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    updateApplications([
      ...applications.filter((application) => application.jobId !== jobId),
      next,
    ]);
  };

  const handleToggleApplied = (jobId: string) => {
    const application = getApplicationByJobId(applications, jobId);
    handleUpdateApplication(jobId, {
      status: application.status === "none" ? "applied" : "none",
    });
  };

  const handleInspectorChange = (
    field: "status" | "note" | "proposalLink",
    value: string,
  ) => {
    if (!inspectorJobId) return;
    if (field === "proposalLink" && value) {
      if (!/^https?:\/\//.test(value)) {
        setInspectorUrlError("Invalid URL format");
        return;
      }
      setInspectorUrlError("");
    } else {
      setInspectorUrlError("");
    }
    if (field === "status") {
      handleUpdateApplication(inspectorJobId, {
        status: value as ApplicationStatus,
      });
      return;
    }
    handleUpdateApplication(inspectorJobId, { [field]: value });
  };

  const handleTestNotification = () => {
    if (!editorRadar) return;
    const emailValid =
      editorRadar.notifications.email.enabled &&
      editorRadar.notifications.email.to &&
      /^\S+@\S+\.\S+$/.test(editorRadar.notifications.email.to);
    const pluginValid =
      editorRadar.notifications.plugin.enabled &&
      editorRadar.notifications.plugin.key;
    if (emailValid || pluginValid) {
      showToast("Sent (demo)");
    } else {
      showToast("Missing config");
    }
  };

  const renderFilterTab = (filters: RadarFilters) => (
    <Card className="flex flex-col gap-component">
      <div className="grid gap-component md:grid-cols-2">
        <label className="flex min-h-target items-center gap-item rounded-control px-component py-control text-ui text-text-secondary transition-colors duration-motion-fast ease-motion-standard hover:bg-fill-tertiary">
          <Checkbox
            checked={filters.verifiedOnly}
            onChange={(event) =>
              handleEditorInput("filters.verifiedOnly", event.target.checked)
            }
          />
          Verified only
        </label>
        <label className="flex min-h-target items-center gap-item rounded-control px-component py-control text-ui text-text-secondary transition-colors duration-motion-fast ease-motion-standard hover:bg-fill-tertiary">
          <Checkbox
            checked={filters.hideApplied}
            onChange={(event) =>
              handleEditorInput("filters.hideApplied", event.target.checked)
            }
          />
          Hide applied
        </label>
        <NumberField
          label="Min spent"
          value={filters.minSpent ?? ""}
          onValueChange={(value) => handleEditorInput("filters.minSpent", value)}
        />
        <NumberField
          label="Min hire rate"
          value={filters.minHireRate ?? ""}
          onValueChange={(value) =>
            handleEditorInput("filters.minHireRate", value)
          }
        />
        <NumberField
          label="Max proposals"
          value={filters.maxProposals ?? ""}
          onValueChange={(value) =>
            handleEditorInput("filters.maxProposals", value)
          }
        />
        <NumberField
          label="Max age (hours)"
          value={filters.maxAgeHours ?? ""}
          onValueChange={(value) =>
            handleEditorInput("filters.maxAgeHours", value)
          }
        />
      </div>

      <div className="flex flex-col gap-item">
        <p className="text-label text-text-muted">Expertise levels</p>
        <div className="flex flex-wrap gap-control text-ui text-text-secondary">
          {(["Entry", "Intermediate", "Expert"] as const).map((level) => (
            <label key={level} className="flex items-center gap-item">
              <Checkbox
                checked={filters.expertiseLevels.includes(level)}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...filters.expertiseLevels, level]
                    : filters.expertiseLevels.filter((item) => item !== level);
                  handleEditorInput("filters.expertiseLevels", next);
                }}
              />
              {level}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-component md:grid-cols-2">
        <FormField
          label="Countries include"
          placeholder="United States, Canada"
          value={filters.countriesInclude.join(", ")}
          onValueChange={(value) =>
            handleEditorInput("filters.countriesInclude", value)
          }
        />
        <FormField
          label="Countries exclude"
          placeholder="Country names"
          value={filters.countriesExclude.join(", ")}
          onValueChange={(value) =>
            handleEditorInput("filters.countriesExclude", value)
          }
        />
        <FormField
          label="Include tags"
          placeholder="react, dashboard"
          value={filters.includeTags.join(", ")}
          onValueChange={(value) =>
            handleEditorInput("filters.includeTags", value)
          }
        />
        <FormField
          label="Exclude tags"
          placeholder="wordpress, scraping"
          value={filters.excludeTags.join(", ")}
          onValueChange={(value) =>
            handleEditorInput("filters.excludeTags", value)
          }
        />
        <NumberField
          label="Min fixed budget"
          value={filters.minBudget ?? ""}
          onValueChange={(value) => handleEditorInput("filters.minBudget", value)}
        />
        <NumberField
          label="Hourly min"
          value={filters.hourlyMin ?? ""}
          onValueChange={(value) => handleEditorInput("filters.hourlyMin", value)}
        />
        <div className="flex flex-col gap-item">
          <NumberField
            label="Hourly max"
            value={filters.hourlyMax ?? ""}
            onValueChange={(value) =>
              handleEditorInput("filters.hourlyMax", value)
            }
          />
          {editorErrors.hourly && (
            <FieldError>{editorErrors.hourly}</FieldError>
          )}
        </div>
      </div>
    </Card>
  );

  const renderWeightsTab = (weights: RadarWeights) => {
    const sum = Object.values(weights).reduce((acc, value) => acc + value, 0);
    return (
      <Card className="flex flex-col gap-component">
        <div className="flex flex-wrap items-center justify-between gap-control">
          <p className="text-body text-text-secondary">
            Sum weights: {sum.toFixed(2)} (normalized in scoring)
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateEditorField("weights", { ...DEFAULT_WEIGHTS })}
          >
            Reset to default
          </Button>
        </div>
        <div className="grid gap-component md:grid-cols-2">
          {Object.entries(weights).map(([key, value]) => (
            <NumberField
              key={key}
              label={key}
              step="0.01"
              value={value}
              onValueChange={(nextValue) =>
                handleEditorInput(`weights.${key}`, nextValue)
              }
            />
          ))}
        </div>
      </Card>
    );
  };

  const renderPreviewTab = (radar: Radar) => {
    const previewMatches = jobs
      .filter((job) => passesFilters(job, radar.filters, applications))
      .map((job) => ({
        job,
        score: computeScore(job, radar).score,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    return (
      <Card>
        {previewMatches.length === 0 ? (
          <EmptyState
            title="No matches for current filters"
            description="Adjust filters or weights to preview results."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-table-sm text-body">
              <thead className="text-label text-text-muted">
                <tr>
                  <th className="px-card py-component text-left">Title</th>
                  <th className="px-card py-component text-left">Score</th>
                  <th className="px-card py-component text-left">Age</th>
                  <th className="px-card py-component text-left">Verified</th>
                  <th className="px-card py-component text-left">Spent</th>
                  <th className="px-card py-component text-left">Proposals</th>
                  <th className="px-card py-component text-left">Country</th>
                  <th className="px-card py-component text-left">Top tags</th>
                </tr>
              </thead>
              <tbody>
                {previewMatches.map(({ job, score }) => (
                  <tr key={job.id} className="border-t border-border">
                    <td className="px-card py-card">{job.title}</td>
                    <td className="px-card py-card">{score}</td>
                    <td className="px-card py-card">{formatAge(job.created_at)}</td>
                    <td className="px-card py-card">
                      {job.is_payment_verified ? "Yes" : "No"}
                    </td>
                    <td className="px-card py-card">{job.total_spent ?? "—"}</td>
                    <td className="px-card py-card">{job.proposals ?? "—"}</td>
                    <td className="px-card py-card">{job.country ?? "—"}</td>
                    <td className="px-card py-card">
                      {job.normalized_stack.slice(0, 3).join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    );
  };

  const renderEditor = () => {
    if (!editorRadar) {
      return null;
    }

    return (
      <div className="flex flex-col gap-card">
        <Card className="flex flex-col gap-component">
          <div className="grid gap-component md:grid-cols-2">
            <div className="flex flex-col gap-item">
              <FormField
                label="Name"
                value={editorRadar.name}
                onValueChange={(value) => handleEditorInput("name", value)}
              />
              {editorErrors.name && <FieldError>{editorErrors.name}</FieldError>}
            </div>
            <label className="flex flex-col gap-item">
              <span className="text-label text-text-muted">Status</span>
              <Select
                value={editorRadar.status}
                onChange={(event) =>
                  handleEditorInput("status", event.target.value)
                }
              >
                {["active", "paused", "disabled"].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </label>
            <label className="flex flex-col gap-item">
              <span className="text-label text-text-muted">Schedule</span>
              <Select
                value={editorRadar.schedule.frequency}
                onChange={(event) =>
                  handleEditorInput("schedule.frequency", event.target.value)
                }
              >
                {["realtime", "hourly", "daily"].map((frequency) => (
                  <option key={frequency} value={frequency}>
                    {frequency}
                  </option>
                ))}
              </Select>
            </label>
            <div className="flex flex-col gap-item">
              <NumberField
                label="Hour of day (0-23)"
                min={0}
                max={23}
                value={editorRadar.schedule.hourOfDay ?? ""}
                onValueChange={(value) =>
                  handleEditorInput("schedule.hourOfDay", value)
                }
              />
              {editorErrors.hourOfDay && (
                <FieldError>{editorErrors.hourOfDay}</FieldError>
              )}
            </div>
          </div>

          <div className="grid gap-component md:grid-cols-2">
            <div className="flex flex-col gap-item">
              <label className="flex items-center gap-item text-ui text-text-secondary">
                <Checkbox
                  checked={editorRadar.notifications.email.enabled}
                  onChange={(event) =>
                    handleEditorInput(
                      "notifications.email.enabled",
                      event.target.checked,
                    )
                  }
                />
                Email notifications
              </label>
              <Input
                placeholder="email@company.com"
                value={editorRadar.notifications.email.to ?? ""}
                onChange={(event) =>
                  handleEditorInput(
                    "notifications.email.to",
                    event.target.value,
                  )
                }
              />
              {editorErrors.email && <FieldError>{editorErrors.email}</FieldError>}
            </div>
            <div className="flex flex-col gap-item">
              <label className="flex items-center gap-item text-ui text-text-secondary">
                <Checkbox
                  checked={editorRadar.notifications.plugin.enabled}
                  onChange={(event) =>
                    handleEditorInput(
                      "notifications.plugin.enabled",
                      event.target.checked,
                    )
                  }
                />
                Plugin notifications
              </label>
              <Input
                placeholder="plugin key"
                value={editorRadar.notifications.plugin.key ?? ""}
                onChange={(event) =>
                  handleEditorInput(
                    "notifications.plugin.key",
                    event.target.value,
                  )
                }
              />
              {editorErrors.plugin && (
                <FieldError>{editorErrors.plugin}</FieldError>
              )}
            </div>
          </div>

          <div>
            <Button variant="ghost" size="sm" onClick={handleTestNotification}>
              Test notification
            </Button>
          </div>
        </Card>

        <div className="flex flex-wrap gap-item">
          {EDITOR_TABS.map((tab) => (
            <Button
              key={tab.value}
              variant={editorTab === tab.value ? "soft" : "ghost"}
              size="sm"
              onClick={() => setEditorTab(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {editorTab === "filters" && renderFilterTab(editorRadar.filters)}
        {editorTab === "weights" && renderWeightsTab(editorRadar.weights)}
        {editorTab === "preview" && renderPreviewTab(editorRadar)}
      </div>
    );
  };

  const renderMatches = () => {
    if (radars.length === 0) {
      return (
        <EmptyState
          title="No radars yet"
          description="Create your first radar to start seeing matches."
          action={
            <Button
              variant="soft"
              size="xs"
              className="gap-item text-text-secondary"
              onClick={handleCreateRadar}
            >
              <PlusIcon className="h-4 w-4" />
              New radar
            </Button>
          }
        />
      );
    }
    if (!activeRadar) {
      return <EmptyState title="Select a radar to view matches" />;
    }
    return (
      <PageShell className="gap-section">
        <PageHeader
          title="Opportunity Radar"
          eyebrow={
            <div className="flex flex-wrap items-center gap-control">
              <Select
                value={activeRadarId ?? ""}
                onChange={(event) => {
                  setActiveRadarId(event.target.value);
                  setInspectorJobId(null);
                }}
              >
                {radars.map((radar) => (
                  <option key={radar.id} value={radar.id}>
                    {radar.name}
                  </option>
                ))}
              </Select>
              <Badge
                tone={
                  activeRadar.status === "active"
                    ? "success"
                    : activeRadar.status === "paused"
                    ? "warning"
                    : "neutral"
                }
              >
                {activeRadar.status}
              </Badge>
            </div>
          }
          actions={
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleStatus(activeRadar)}
              >
                {activeRadar.status === "active" ? "Pause" : "Activate"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditRadar(activeRadar)}
              >
                Edit radar
              </Button>
              <Button
                variant="soft"
                size="xs"
                className="gap-item text-text-secondary"
                onClick={handleCreateRadar}
              >
                <PlusIcon className="h-4 w-4" />
                New radar
              </Button>
            </>
          }
        />

        <ContentToolbar className="flex-row flex-wrap items-center">
          <Input
            placeholder="Search title..."
            value={matchesSearch}
            onChange={(event) => setMatchesSearch(event.target.value)}
            className="max-w-search-compact"
          />
          <Select
            value={matchesSort}
            onChange={(event) =>
              setMatchesSort(event.target.value as SortKey)
            }
          >
            <option value="score_desc">Score desc</option>
            <option value="age_asc">Age asc</option>
          </Select>
          <label className="flex items-center gap-item text-ui text-text-secondary">
            <Checkbox
              checked={matchesHideApplied}
              onChange={(event) => setMatchesHideApplied(event.target.checked)}
            />
            Hide applied
          </label>
          <div className="flex items-center gap-item text-ui text-text-secondary">
            <span>Min score</span>
            <Input
              type="number"
              value={matchesMinScore}
              onChange={(event) =>
                setMatchesMinScore(Number(event.target.value))
              }
              className="w-number-field"
            />
          </div>
        </ContentToolbar>

        {filteredMatches.length === 0 ? (
          <EmptyState
            title="No matches"
            description="Adjust filters or wait for new jobs."
          />
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full min-w-table-lg text-body">
              <thead className="text-label text-text-muted">
                <tr>
                  <th className="px-component py-control text-left">Score</th>
                  <th className="px-component py-control text-left">Age</th>
                  <th className="px-component py-control text-left">Proposals</th>
                  <th className="px-component py-control text-left">Verified</th>
                  <th className="px-component py-control text-left">Spent</th>
                  <th className="px-component py-control text-left">Hire rate</th>
                  <th className="px-component py-control text-left">Budget</th>
                  <th className="px-component py-control text-left">Expertise</th>
                  <th className="px-component py-control text-left">Country</th>
                  <th className="px-component py-control text-left">Tags</th>
                  <th className="px-component py-control text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatches.map((match) => {
                  const job = jobs.find((item) => item.id === match.jobId);
                  if (!job) return null;
                  const app = getApplicationByJobId(applications, job.id);
                  const budget = !job.budget
                    ? "—"
                    : job.budget.type === "fixed"
                    ? `$${job.budget.amount} fixed`
                    : `$${job.budget.min}-${job.budget.max}/h`;
                  return (
                    <tr key={match.jobId} className="border-t border-separator">
                      <td className="px-component py-card">{match.score}</td>
                      <td className="px-component py-card">{formatAge(job.created_at)}</td>
                      <td className="px-component py-card">{job.proposals ?? "—"}</td>
                      <td className="px-component py-card">
                        {job.is_payment_verified ? "Yes" : "No"}
                      </td>
                      <td className="px-component py-card">{job.total_spent ?? "—"}</td>
                      <td className="px-component py-card">{job.hire_rate ?? "—"}</td>
                      <td className="px-component py-card">{budget}</td>
                      <td className="px-component py-card">{job.experience ?? "—"}</td>
                      <td className="px-component py-card">{job.country ?? "—"}</td>
                      <td className="px-component py-card">
                        {job.normalized_stack.slice(0, 3).join(", ")}
                      </td>
                      <td className="px-component py-card">
                        <div className="flex flex-wrap gap-item">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(job.url, "_blank")}
                          >
                            Open job
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleApplied(job.id)}
                          >
                            {app.status === "none" ? "Mark applied" : "Unmark"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setInspectorJobId(job.id)}
                          >
                            Inspector
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </PageShell>
    );
  };

  const renderInspector = () => {
    if (!inspectorJob || !inspectorMatch) return null;
    const application = getApplicationByJobId(applications, inspectorJob.id);
    const chips = [
      inspectorJob.is_payment_verified ? "Verified" : "Not verified",
      inspectorJob.total_spent
        ? `$${inspectorJob.total_spent} spent`
        : "No spend",
      inspectorJob.hire_rate != null
        ? `${inspectorJob.hire_rate}% hire`
        : "No hire rate",
      inspectorJob.budget
        ? inspectorJob.budget.type === "fixed"
          ? `$${inspectorJob.budget.amount} fixed`
          : `$${inspectorJob.budget.min}-${inspectorJob.budget.max}/h`
        : "No budget",
      formatAge(inspectorJob.created_at),
    ];

    return (
      <Sheet
        open={Boolean(inspectorJobId)}
        onOpenChange={(open) => {
          if (!open) setInspectorJobId(null);
        }}
      >
        <SheetContent className="flex w-full max-w-viewport-safe flex-col gap-0 overflow-hidden p-0 sm:max-w-sheet-sm">
          <OverlayHeader className="pr-spacious text-left">
            <SheetTitle className="line-clamp-3 text-ui text-text-primary">
              {inspectorJob.title}
            </SheetTitle>
            <SheetDescription asChild>
              <a
                href={inspectorJob.url}
                target="_blank"
                rel="noreferrer"
                className="text-label text-link hover:text-link-hover"
              >
                Open job
              </a>
            </SheetDescription>
          </OverlayHeader>

          <ScrollArea className="min-h-0 flex-1">
            <OverlayBody className="space-y-card">
              <div className="flex flex-wrap gap-item">
                {chips.map((chip) => (
                  <Badge key={chip} tone="info">
                    {chip}
                  </Badge>
                ))}
                {inspectorJob.normalized_stack.map((tag) => (
                  <Badge key={tag} tone="neutral">
                    {tag}
                  </Badge>
                ))}
              </div>

              <section className="space-y-control">
                <p className="text-label text-text-muted">Applied status</p>
                <Select
                  value={application.status}
                  onChange={(event) =>
                    handleInspectorChange("status", event.target.value)
                  }
                >
                  {[
                    "none",
                    "applied",
                    "shortlisted",
                    "interview",
                    "hired",
                    "declined",
                  ].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
                <div className="flex flex-col gap-item">
                  <p className="text-label text-text-muted">Note</p>
                  <Textarea
                    value={application.note ?? ""}
                    onChange={(event) =>
                      handleInspectorChange("note", event.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col gap-item">
                  <p className="text-label text-text-muted">Proposal link</p>
                  <Input
                    value={application.proposalLink ?? ""}
                    onChange={(event) =>
                      handleInspectorChange("proposalLink", event.target.value)
                    }
                  />
                  {inspectorUrlError && (
                    <p className="text-body text-destructive">
                      {inspectorUrlError}
                    </p>
                  )}
                </div>
              </section>

              {inspectorMatch.reasons && (
                <section className="space-y-control">
                  <p className="text-label text-text-muted">Why this score</p>
                  <table className="w-full text-data text-text-secondary">
                    <thead className="text-label text-text-muted">
                      <tr>
                        <th className="py-micro text-left">Signal</th>
                        <th className="py-micro text-left">Weight</th>
                        <th className="py-micro text-left">Signal</th>
                        <th className="py-micro text-left">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inspectorMatch.reasons.map((reason) => (
                        <tr key={reason.key} className="border-t border-separator">
                          <td className="py-micro">{reason.key}</td>
                          <td className="py-micro">
                            {reason.weight.toFixed(2)}
                          </td>
                          <td className="py-micro">
                            {reason.signal.toFixed(2)}
                          </td>
                          <td className="py-micro">{reason.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )}
            </OverlayBody>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  };

  const renderEditorDrawer = () => {
    if (!isEditorOpen || !editorRadar) return null;

    return (
      <Sheet
        open={isEditorOpen}
        onOpenChange={(open) => {
          if (!open) closeEditor();
        }}
      >
        <SheetContent className="flex w-full max-w-viewport-safe flex-col gap-0 overflow-hidden p-0 sm:max-w-sheet-md">
          <OverlayHeader className="pr-spacious text-left">
            <SheetTitle className="text-heading text-text-primary">
              {editorRadar.name || "New Radar"}
            </SheetTitle>
            <SheetDescription className="text-body text-text-secondary">
              Radar Editor
            </SheetDescription>
          </OverlayHeader>

          <ScrollArea className="min-h-0 flex-1">
            <OverlayBody>
              {renderEditor()}
            </OverlayBody>
          </ScrollArea>

          <OverlayFooter className="flex flex-col-reverse gap-control sm:flex-row sm:justify-between sm:space-x-0">
            <Button
              variant="ghost"
              onClick={() => handleExportRadar(editorRadar)}
            >
              Export JSON
            </Button>
            <div className="flex items-center gap-control">
              <Button variant="ghost" onClick={closeEditor}>
                Cancel
              </Button>
              <Button onClick={handleSaveRadar}>Save</Button>
            </div>
          </OverlayFooter>
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <div className="relative">
      {renderMatches()}

      {!isEditorOpen && inspectorJobId && renderInspector()}
      {renderEditorDrawer()}

      <div className="fixed bottom-card right-card z-50 flex flex-col gap-item">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="rounded-control border border-island-border bg-material-vibrant px-component py-control text-body text-text-primary shadow-premium backdrop-blur-2xl"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};

const validateRadar = (radar: Radar) => {
  const errors: Record<string, string> = {};

  if (!radar.name || radar.name.trim().length === 0) {
    errors.name = "Name is required";
  }

  if (radar.notifications.email.enabled) {
    if (!radar.notifications.email.to) {
      errors.email = "Email required";
    } else if (!/^\S+@\S+\.\S+$/.test(radar.notifications.email.to)) {
      errors.email = "Invalid email";
    }
  }

  if (radar.notifications.plugin.enabled && !radar.notifications.plugin.key) {
    errors.plugin = "Plugin key required";
  }

  if (
    radar.filters.hourlyMin != null &&
    radar.filters.hourlyMax != null &&
    radar.filters.hourlyMin > radar.filters.hourlyMax
  ) {
    errors.hourly = "Hourly min must be <= max";
  }

  if (radar.schedule.frequency === "daily") {
    if (
      radar.schedule.hourOfDay == null ||
      Number.isNaN(radar.schedule.hourOfDay)
    ) {
      errors.hourOfDay = "Hour required";
    }
  }

  return errors;
};

export default OpportunityRadar;
