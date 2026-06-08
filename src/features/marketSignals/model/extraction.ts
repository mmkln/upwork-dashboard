import type { PreparedUpworkJob } from "../../../models";
import { UNKNOWN_VALUE } from "../constants";
import type { ExtractedSignalFields, RelevanceResult } from "../types";

type KeywordRule = {
  label: string;
  keywords: string[];
};

const requestCategoryRules: KeywordRule[] = [
  {
    label: "CRM Automation",
    keywords: ["crm", "pipeline", "workflow", "lead", "follow up", "follow-up"],
  },
  {
    label: "AI Automation",
    keywords: ["ai", "chatgpt", "openai", "bot", "agent", "automation"],
  },
  {
    label: "Sales Outreach",
    keywords: ["outreach", "cold email", "sales", "appointment", "lead gen"],
  },
  {
    label: "Data Dashboard",
    keywords: ["dashboard", "reporting", "analytics", "data", "looker"],
  },
  {
    label: "Website / Landing Page",
    keywords: ["landing page", "website", "webflow", "wordpress"],
  },
  {
    label: "E-commerce Setup",
    keywords: ["shopify", "woocommerce", "ecommerce", "e-commerce"],
  },
  {
    label: "Video Editing",
    keywords: ["video", "youtube", "premiere", "after effects", "editing"],
  },
];

const clientTypeRules: KeywordRule[] = [
  {
    label: "Agency",
    keywords: ["agency", "client", "white label", "white-label"],
  },
  {
    label: "Local Business",
    keywords: ["local business", "clinic", "dental", "roofing", "real estate"],
  },
  {
    label: "Coach / Consultant",
    keywords: ["coach", "consultant", "course creator", "mentor"],
  },
  {
    label: "E-commerce Brand",
    keywords: ["shopify", "store", "brand", "ecommerce", "e-commerce"],
  },
  {
    label: "SaaS Company",
    keywords: ["saas", "software", "startup", "subscription"],
  },
];

const buyerNeedRules: KeywordRule[] = [
  {
    label: "Lost leads",
    keywords: ["lost lead", "lead follow", "missed lead", "pipeline"],
  },
  {
    label: "Manual work",
    keywords: ["manual", "spreadsheet", "repetitive", "automate"],
  },
  {
    label: "Broken workflow",
    keywords: ["fix", "broken", "not working", "issue", "error"],
  },
  {
    label: "Campaign launch",
    keywords: ["launch", "campaign", "funnel", "ads"],
  },
  {
    label: "Better reporting",
    keywords: ["report", "dashboard", "analytics", "tracking"],
  },
  {
    label: "Audience growth",
    keywords: ["youtube", "content", "social media", "audience"],
  },
];

const urgencyRules: KeywordRule[] = [
  { label: "ASAP", keywords: ["asap", "urgent", "immediately"] },
  {
    label: "Deadline mentioned",
    keywords: ["deadline", "due date", "by monday", "by friday"],
  },
  {
    label: "Launch soon",
    keywords: ["launch", "go live", "this week", "next week"],
  },
  {
    label: "Urgent fix",
    keywords: ["fix asap", "broken", "not working", "critical"],
  },
];

const findRuleLabel = (text: string, rules: KeywordRule[]) => {
  const rule = rules.find((item) =>
    item.keywords.some((keyword) => text.includes(keyword)),
  );
  return rule?.label ?? UNKNOWN_VALUE;
};

const formatCurrency = (value: number) => `$${Math.round(value).toLocaleString()}`;

const buildBudgetSignal = (job: PreparedUpworkJob) => {
  if (job.fixedPriceValue != null) {
    return `Fixed: ${formatCurrency(job.fixedPriceValue)}`;
  }
  if (job.hourlyRateValues.length >= 2) {
    const sortedRates = [...job.hourlyRateValues].sort((a, b) => a - b);
    return `Hourly: ${formatCurrency(sortedRates[0])}-${formatCurrency(
      sortedRates[sortedRates.length - 1],
    )}/hr`;
  }
  if (job.hourlyRateAverage != null) {
    return `Hourly: ${formatCurrency(job.hourlyRateAverage)}/hr average`;
  }
  if (job.average_rate != null) {
    return `Client average: ${formatCurrency(job.average_rate)}/hr`;
  }
  if (job.total_spent != null && job.total_spent > 0) {
    return `Client spent: ${formatCurrency(job.total_spent)}`;
  }
  return "Budget unknown";
};

const getExactClientLanguage = (
  job: PreparedUpworkJob,
  relevance: RelevanceResult,
) => {
  const description = job.description?.replace(/\s+/g, " ").trim();
  if (!description) return job.title;

  const keyword = relevance.matchedIncludeKeywords[0];
  if (!keyword) return description.slice(0, 180);

  const matchIndex = description.toLowerCase().indexOf(keyword.toLowerCase());
  if (matchIndex < 0) return description.slice(0, 180);

  const start = Math.max(matchIndex - 70, 0);
  const end = Math.min(matchIndex + keyword.length + 110, description.length);
  return description.slice(start, end).trim();
};

const inferDifficulty = (job: PreparedUpworkJob, requestCategory: string) => {
  const text = job.searchableText.toLowerCase();
  if (text.includes("senior") || text.includes("expert")) return 4;
  if (text.includes("simple") || text.includes("quick") || text.includes("basic")) {
    return 2;
  }
  if (requestCategory === "AI Automation" || requestCategory === "Data Dashboard") {
    return 3;
  }
  return 3;
};

const inferSpeedToValue = (job: PreparedUpworkJob, urgencySignal: string) => {
  const text = job.searchableText.toLowerCase();
  if (urgencySignal !== "No urgency found") return 5;
  if (text.includes("fix") || text.includes("setup") || text.includes("template")) {
    return 4;
  }
  if (text.includes("strategy") || text.includes("consult")) return 3;
  return 3;
};

export const extractSignalFields = (
  job: PreparedUpworkJob,
  relevance: RelevanceResult,
): ExtractedSignalFields => {
  const text = job.searchableText.toLowerCase();
  const requestCategory = findRuleLabel(text, requestCategoryRules);
  const clientType = findRuleLabel(text, clientTypeRules);
  const urgencySignal = findRuleLabel(text, urgencyRules);
  const finalUrgencySignal =
    urgencySignal === UNKNOWN_VALUE ? "No urgency found" : urgencySignal;
  const difficulty = inferDifficulty(job, requestCategory);

  return {
    requestCategory,
    clientType,
    niche: job.client_industry || UNKNOWN_VALUE,
    problem: job.title || UNKNOWN_VALUE,
    exactClientLanguage: getExactClientLanguage(job, relevance),
    buyerNeed: findRuleLabel(text, buyerNeedRules),
    budgetSignal: buildBudgetSignal(job),
    urgencySignal: finalUrgencySignal,
    requiredSkills: job.skills ?? [],
    relatedTools: Array.from(job.matchedInstruments),
    difficulty,
    speedToValue: inferSpeedToValue(job, finalUrgencySignal),
    patternGroup: "",
    notes: "",
  };
};

