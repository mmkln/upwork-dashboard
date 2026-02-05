
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  Input,
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

    if (path.startsWith("weights.") && typeof value === "string") {
      const numberValue = Number(value);
      updateEditorField(path, Number.isNaN(numberValue) ? 0 : numberValue);
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
    <Card className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="flex items-center gap-2 text-xs text-[#575757]">
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(event) =>
              handleEditorInput("filters.verifiedOnly", event.target.checked)
            }
          />
          Verified only
        </label>
        <Input
          type="number"
          placeholder="Min spent"
          value={filters.minSpent ?? ""}
          onChange={(event) =>
            handleEditorInput("filters.minSpent", event.target.value)
          }
        />
        <Input
          type="number"
          placeholder="Min hire rate"
          value={filters.minHireRate ?? ""}
          onChange={(event) =>
            handleEditorInput("filters.minHireRate", event.target.value)
          }
        />
        <Input
          type="number"
          placeholder="Max proposals"
          value={filters.maxProposals ?? ""}
          onChange={(event) =>
            handleEditorInput("filters.maxProposals", event.target.value)
          }
        />
        <Input
          type="number"
          placeholder="Max age (hours)"
          value={filters.maxAgeHours ?? ""}
          onChange={(event) =>
            handleEditorInput("filters.maxAgeHours", event.target.value)
          }
        />
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[#575757]">Expertise levels</p>
          <div className="flex flex-wrap gap-3 text-xs text-[#575757]">
            {(["Entry", "Intermediate", "Expert"] as const).map((level) => (
              <label key={level} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.expertiseLevels.includes(level)}
                  onChange={(event) => {
                    const next = event.target.checked
                      ? [...filters.expertiseLevels, level]
                      : filters.expertiseLevels.filter(
                          (item) => item !== level,
                        );
                    handleEditorInput("filters.expertiseLevels", next);
                  }}
                />
                {level}
              </label>
            ))}
          </div>
        </div>
        <Input
          placeholder="Countries include (comma separated)"
          value={filters.countriesInclude.join(", ")}
          onChange={(event) =>
            handleEditorInput("filters.countriesInclude", event.target.value)
          }
        />
        <Input
          placeholder="Countries exclude (comma separated)"
          value={filters.countriesExclude.join(", ")}
          onChange={(event) =>
            handleEditorInput("filters.countriesExclude", event.target.value)
          }
        />
        <Input
          placeholder="Include tags (comma separated)"
          value={filters.includeTags.join(", ")}
          onChange={(event) =>
            handleEditorInput("filters.includeTags", event.target.value)
          }
        />
        <Input
          placeholder="Exclude tags (comma separated)"
          value={filters.excludeTags.join(", ")}
          onChange={(event) =>
            handleEditorInput("filters.excludeTags", event.target.value)
          }
        />
        <Input
          type="number"
          placeholder="Min fixed budget"
          value={filters.minBudget ?? ""}
          onChange={(event) =>
            handleEditorInput("filters.minBudget", event.target.value)
          }
        />
        <Input
          type="number"
          placeholder="Hourly min"
          value={filters.hourlyMin ?? ""}
          onChange={(event) =>
            handleEditorInput("filters.hourlyMin", event.target.value)
          }
        />
        <div className="flex flex-col gap-2">
          <Input
            type="number"
            placeholder="Hourly max"
            value={filters.hourlyMax ?? ""}
            onChange={(event) =>
              handleEditorInput("filters.hourlyMax", event.target.value)
            }
          />
          {editorErrors.hourly && (
            <p className="text-xs text-red-600">{editorErrors.hourly}</p>
          )}
        </div>
        <label className="flex items-center gap-2 text-xs text-[#575757]">
          <input
            type="checkbox"
            checked={filters.hideApplied}
            onChange={(event) =>
              handleEditorInput("filters.hideApplied", event.target.checked)
            }
          />
          Hide applied
        </label>
      </div>
    </Card>
  );

  const renderWeightsTab = (weights: RadarWeights) => {
    const sum = Object.values(weights).reduce((acc, value) => acc + value, 0);
    return (
      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[#8A8A8A]">
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(weights).map(([key, value]) => (
            <Input
              key={key}
              type="number"
              step="0.01"
              placeholder={key}
              value={value}
              onChange={(event) =>
                handleEditorInput(`weights.${key}`, event.target.value)
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
            <table className="min-w-[640px] w-full text-sm">
              <thead className="text-xs text-[#8A8A8A] uppercase">
                <tr>
                  <th className="text-left py-2">Title</th>
                  <th className="text-left py-2">Score</th>
                  <th className="text-left py-2">Age</th>
                  <th className="text-left py-2">Verified</th>
                  <th className="text-left py-2">Spent</th>
                  <th className="text-left py-2">Proposals</th>
                  <th className="text-left py-2">Country</th>
                  <th className="text-left py-2">Top tags</th>
                </tr>
              </thead>
              <tbody>
                {previewMatches.map(({ job, score }) => (
                  <tr key={job.id} className="border-t border-[#EFEFEF]">
                    <td className="py-2">{job.title}</td>
                    <td className="py-2">{score}</td>
                    <td className="py-2">{formatAge(job.created_at)}</td>
                    <td className="py-2">
                      {job.is_payment_verified ? "Yes" : "No"}
                    </td>
                    <td className="py-2">{job.total_spent ?? "—"}</td>
                    <td className="py-2">{job.proposals ?? "—"}</td>
                    <td className="py-2">{job.country ?? "—"}</td>
                    <td className="py-2">
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
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-semibold text-[#141414]">
            Radar Editor
          </h2>
          <p className="mt-1 text-sm text-[#6B7280]">
            Editing: {editorRadar.name}
          </p>
        </div>

        <Card className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[#575757]">Name</p>
              <Input
                value={editorRadar.name}
                onChange={(event) =>
                  handleEditorInput("name", event.target.value)
                }
              />
              {editorErrors.name && (
                <p className="text-xs text-red-600">{editorErrors.name}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[#575757]">Status</p>
              <select
                className="rounded-[10px] border border-[#EFF0F0] h-10 px-4 text-sm text-[#141414]"
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
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[#575757]">Schedule</p>
              <select
                className="rounded-[10px] border border-[#EFF0F0] h-10 px-4 text-sm text-[#141414]"
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
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-[#575757]">Hour of day (0-23)</p>
              <Input
                type="number"
                value={editorRadar.schedule.hourOfDay ?? ""}
                onChange={(event) =>
                  handleEditorInput(
                    "schedule.hourOfDay",
                    event.target.value,
                  )
                }
              />
              {editorErrors.hourOfDay && (
                <p className="text-xs text-red-600">
                  {editorErrors.hourOfDay}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs text-[#575757]">
                <input
                  type="checkbox"
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
              {editorErrors.email && (
                <p className="text-xs text-red-600">{editorErrors.email}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-xs text-[#575757]">
                <input
                  type="checkbox"
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
                <p className="text-xs text-red-600">{editorErrors.plugin}</p>
              )}
            </div>
          </div>

          <div>
            <Button variant="ghost" size="sm" onClick={handleTestNotification}>
              Test notification
            </Button>
          </div>
        </Card>

        <div className="flex flex-wrap gap-2">
          {(["filters", "weights", "preview"] as const).map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              size="sm"
              className={editorTab === tab ? "bg-[#F6F8FF]" : ""}
              onClick={() => setEditorTab(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>

        {editorTab === "filters" && renderFilterTab(editorRadar.filters)}
        {editorTab === "weights" && renderWeightsTab(editorRadar.weights)}
        {editorTab === "preview" && renderPreviewTab(editorRadar)}

        <div className="flex items-center gap-3">
          <Button onClick={handleSaveRadar}>Save</Button>
          <Button variant="ghost" onClick={closeEditor}>
            Cancel
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleExportRadar(editorRadar)}
          >
            Export JSON
          </Button>
        </div>
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
              className="gap-1.5 text-[#575757]"
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
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold text-[#141414]">
                Opportunity Radar
              </h1>
              <p className="mt-1 text-sm text-[#6B7280]">
                Matches for the selected radar.
              </p>
            </div>
            <select
              className="rounded-[10px] border border-[#EFF0F0] h-10 px-4 text-sm text-[#141414]"
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
            </select>
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
          <div className="flex flex-wrap items-center gap-2">
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
              className="gap-1.5 text-[#575757]"
              onClick={handleCreateRadar}
            >
              <PlusIcon className="h-4 w-4" />
              New radar
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search title..."
            value={matchesSearch}
            onChange={(event) => setMatchesSearch(event.target.value)}
            className="max-w-[220px]"
          />
          <select
            className="rounded-[10px] border border-[#EFF0F0] h-10 px-4 text-sm text-[#141414]"
            value={matchesSort}
            onChange={(event) =>
              setMatchesSort(event.target.value as SortKey)
            }
          >
            <option value="score_desc">Score desc</option>
            <option value="age_asc">Age asc</option>
          </select>
          <label className="flex items-center gap-2 text-xs text-[#575757]">
            <input
              type="checkbox"
              checked={matchesHideApplied}
              onChange={(event) => setMatchesHideApplied(event.target.checked)}
            />
            Hide applied
          </label>
          <div className="flex items-center gap-2 text-xs text-[#575757]">
            <span>Min score</span>
            <Input
              type="number"
              value={matchesMinScore}
              onChange={(event) =>
                setMatchesMinScore(Number(event.target.value))
              }
              className="w-[80px]"
            />
          </div>
        </div>

        {filteredMatches.length === 0 ? (
          <EmptyState
            title="No matches"
            description="Adjust filters or wait for new jobs."
          />
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-[#8A8A8A] uppercase">
                <tr>
                  <th className="text-left py-2">Score</th>
                  <th className="text-left py-2">Age</th>
                  <th className="text-left py-2">Proposals</th>
                  <th className="text-left py-2">Verified</th>
                  <th className="text-left py-2">Spent</th>
                  <th className="text-left py-2">Hire rate</th>
                  <th className="text-left py-2">Budget</th>
                  <th className="text-left py-2">Expertise</th>
                  <th className="text-left py-2">Country</th>
                  <th className="text-left py-2">Tags</th>
                  <th className="text-left py-2">Actions</th>
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
                    <tr key={match.jobId} className="border-t border-[#EFEFEF]">
                      <td className="py-2">{match.score}</td>
                      <td className="py-2">{formatAge(job.created_at)}</td>
                      <td className="py-2">{job.proposals ?? "—"}</td>
                      <td className="py-2">
                        {job.is_payment_verified ? "Yes" : "No"}
                      </td>
                      <td className="py-2">{job.total_spent ?? "—"}</td>
                      <td className="py-2">{job.hire_rate ?? "—"}</td>
                      <td className="py-2">{budget}</td>
                      <td className="py-2">{job.experience ?? "—"}</td>
                      <td className="py-2">{job.country ?? "—"}</td>
                      <td className="py-2">
                        {job.normalized_stack.slice(0, 3).join(", ")}
                      </td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-2">
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
      </div>
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
      <div className="fixed right-0 top-0 h-full w-[360px] border-l border-[#EAEBEB] bg-white p-5 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#141414]">
              {inspectorJob.title}
            </h2>
            <a
              href={inspectorJob.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[#1823F0]"
            >
              Open job
            </a>
          </div>
          <IconButton
            variant="outline"
            size="sm"
            onClick={() => setInspectorJobId(null)}
            aria-label="Close inspector"
          >
            ×
          </IconButton>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
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

        <Card className="mt-5 flex flex-col gap-3">
          <p className="text-xs text-[#8A8A8A]">Applied status</p>
          <select
            className="rounded-[10px] border border-[#EFF0F0] h-10 px-4 text-sm text-[#141414]"
            value={application.status}
            onChange={(event) =>
              handleInspectorChange("status", event.target.value)
            }
          >
            {["none", "applied", "shortlisted", "interview", "hired", "declined"].map(
              (status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ),
            )}
          </select>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-[#575757]">Note</p>
            <textarea
              className="rounded-[10px] border border-[#EFF0F0] px-3 py-2 text-sm text-[#141414]"
              value={application.note ?? ""}
              onChange={(event) =>
                handleInspectorChange("note", event.target.value)
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-[#575757]">Proposal link</p>
            <Input
              value={application.proposalLink ?? ""}
              onChange={(event) =>
                handleInspectorChange("proposalLink", event.target.value)
              }
            />
            {inspectorUrlError && (
              <p className="text-xs text-red-600">{inspectorUrlError}</p>
            )}
          </div>
        </Card>

        {inspectorMatch.reasons && (
          <Card className="mt-5">
            <p className="text-xs text-[#8A8A8A]">Why this score</p>
            <table className="w-full text-xs mt-2">
              <thead className="text-[#8A8A8A] uppercase">
                <tr>
                  <th className="text-left py-1">Signal</th>
                  <th className="text-left py-1">Weight</th>
                  <th className="text-left py-1">Signal</th>
                  <th className="text-left py-1">Points</th>
                </tr>
              </thead>
              <tbody>
                {inspectorMatch.reasons.map((reason) => (
                  <tr key={reason.key} className="border-t border-[#EFEFEF]">
                    <td className="py-1">{reason.key}</td>
                    <td className="py-1">{reason.weight.toFixed(2)}</td>
                    <td className="py-1">{reason.signal.toFixed(2)}</td>
                    <td className="py-1">{reason.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    );
  };

  const renderEditorDrawer = () => {
    if (!isEditorOpen || !editorRadar) return null;

    return (
      <div className="fixed inset-0 z-40">
        <div
          className="absolute inset-0 bg-black/20"
          onClick={closeEditor}
          aria-hidden="true"
        />
        <div className="absolute right-0 top-0 flex h-full w-[520px] max-w-[90vw] flex-col border-l border-[#EAEBEB] bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-[#EFEFEF] px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[#141414]">
                {editorRadar.name || "New Radar"}
              </h2>
              <p className="text-xs text-[#8A8A8A]">Radar Editor</p>
            </div>
            <IconButton
              variant="outline"
              size="sm"
              onClick={closeEditor}
              aria-label="Close editor"
            >
              ×
            </IconButton>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            {renderEditor()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {renderMatches()}

      {!isEditorOpen && inspectorJobId && renderInspector()}
      {renderEditorDrawer()}

      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="rounded-[10px] bg-[#141414] text-white px-3 py-2 text-xs shadow-lg"
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
