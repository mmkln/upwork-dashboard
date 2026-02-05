import type { Application, Job, Radar, RadarFilters, RadarMatchReason } from "./types";
import { DEFAULT_WEIGHTS } from "./seed";

const EU_COUNTRIES = [
  "Poland",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Romania",
];

export const hoursSince = (dateString: string) => {
  const diff = Date.now() - new Date(dateString).getTime();
  return Math.max(0, diff / 36e5);
};

export const formatAge = (dateString: string) => {
  const hours = hoursSince(dateString);
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

export const getApplicationByJobId = (
  applications: Application[],
  jobId: string,
): Application => {
  return (
    applications.find((application) => application.jobId === jobId) || {
      jobId,
      status: "none",
      note: "",
      proposalLink: "",
      updatedAt: new Date().toISOString(),
    }
  );
};

export const passesFilters = (
  job: Job,
  filters: RadarFilters,
  applications: Application[],
) => {
  const proposals = job.proposals ?? 99;
  const spent = job.total_spent ?? 0;
  const hireRate = job.hire_rate ?? 0;
  const ageHours = hoursSince(job.created_at);

  if (filters.verifiedOnly && !job.is_payment_verified) return false;
  if (filters.minSpent != null && spent < filters.minSpent) return false;
  if (filters.minHireRate != null && hireRate < filters.minHireRate) return false;
  if (filters.maxProposals != null && proposals > filters.maxProposals)
    return false;
  if (filters.maxAgeHours != null && ageHours > filters.maxAgeHours)
    return false;

  if (
    filters.expertiseLevels.length &&
    job.experience &&
    !filters.expertiseLevels.includes(job.experience)
  ) {
    return false;
  }

  if (
    filters.countriesInclude.length &&
    (!job.country || !filters.countriesInclude.includes(job.country))
  ) {
    return false;
  }

  if (
    filters.countriesExclude.length &&
    job.country &&
    filters.countriesExclude.includes(job.country)
  ) {
    return false;
  }

  if (filters.includeTags.length) {
    const hasAll = filters.includeTags.every((tag) =>
      job.normalized_stack.includes(tag.toLowerCase()),
    );
    if (!hasAll) return false;
  }

  if (filters.excludeTags.length) {
    const hasExcluded = filters.excludeTags.some((tag) =>
      job.normalized_stack.includes(tag.toLowerCase()),
    );
    if (hasExcluded) return false;
  }

  if (filters.minBudget != null) {
    if (!job.budget || job.budget.type !== "fixed") return false;
    if (job.budget.amount < filters.minBudget) return false;
  }

  if (filters.hourlyMin != null || filters.hourlyMax != null) {
    if (!job.budget || job.budget.type !== "hourly") return false;
    const jobMin = job.budget.min;
    const jobMax = job.budget.max;
    const desiredMin = filters.hourlyMin ?? 0;
    const desiredMax = filters.hourlyMax ?? 9999;
    const overlap = Math.min(jobMax, desiredMax) - Math.max(jobMin, desiredMin);
    if (overlap <= 0) return false;
  }

  if (filters.hideApplied) {
    const application = getApplicationByJobId(applications, job.id);
    if (application.status !== "none") return false;
  }

  return true;
};

const freshnessScore = (ageHours: number) => {
  if (ageHours <= 24) return 1.0;
  if (ageHours <= 72) return 0.8;
  if (ageHours <= 168) return 0.6;
  if (ageHours <= 336) return 0.4;
  return 0.2;
};

const proposalsScore = (proposals: number | null) => {
  if (proposals == null) return 0.5;
  if (proposals <= 5) return 1.0;
  if (proposals <= 10) return 0.8;
  if (proposals <= 20) return 0.6;
  return 0.3;
};

const spendScore = (spent: number | null) => {
  if (spent == null) return 0.4;
  if (spent >= 100000) return 1.0;
  if (spent >= 50000) return 0.9;
  if (spent >= 10000) return 0.7;
  if (spent >= 1000) return 0.5;
  return 0.2;
};

const trustScore = (job: Job) => {
  const paymentScore = job.is_payment_verified ? 1.0 : 0.2;
  return 0.5 * paymentScore + 0.5 * spendScore(job.total_spent);
};

const hireRateScore = (hireRate: number | null) => {
  if (hireRate == null) return 0.4;
  return Math.min(1, Math.max(0, hireRate / 100));
};

const expertiseScore = (experience: Job["experience"]) => {
  if (experience === "Expert") return 1.0;
  if (experience === "Intermediate") return 0.7;
  if (experience === "Entry") return 0.4;
  return 0.5;
};

const geoScore = (country: string | null) => {
  if (!country) return 0.6;
  if (EU_COUNTRIES.includes(country)) return 0.8;
  if (country === "United States" || country === "Canada") return 0.6;
  return 0.5;
};

const stackScore = (job: Job, filters: RadarFilters) => {
  if (!filters.includeTags.length) return 0.6;
  const hits = filters.includeTags.filter((tag) =>
    job.normalized_stack.includes(tag.toLowerCase()),
  ).length;
  return hits / filters.includeTags.length;
};

const budgetFitness = (job: Job, filters: RadarFilters) => {
  if (!job.budget) return 0.5;
  if (job.budget.type === "hourly") {
    if (filters.hourlyMin == null && filters.hourlyMax == null) return 0.5;
    const desiredMin = filters.hourlyMin ?? 0;
    const desiredMax = filters.hourlyMax ?? desiredMin + 1;
    const width = Math.max(1, desiredMax - desiredMin);
    const overlap = Math.max(
      0,
      Math.min(job.budget.max, desiredMax) -
        Math.max(job.budget.min, desiredMin),
    );
    return Math.min(1, overlap / width);
  }
  if (job.budget.type === "fixed") {
    const amount = job.budget.amount;
    if (amount < 100) return 0.3;
    if (amount < 500) return 0.6;
    if (amount > 2000) return 1.0;
    return 0.8;
  }
  return 0.5;
};

export const computeScore = (
  job: Job,
  radar: Radar,
): { score: number; reasons: RadarMatchReason[] } => {
  const signals = {
    freshness: freshnessScore(hoursSince(job.created_at)),
    lowProposals: proposalsScore(job.proposals),
    trust: trustScore(job),
    hireRate: hireRateScore(job.hire_rate),
    budget: budgetFitness(job, radar.filters),
    expertise: expertiseScore(job.experience),
    geo: geoScore(job.country),
    stack: stackScore(job, radar.filters),
  };

  const weights = radar.weights || DEFAULT_WEIGHTS;
  const sum = Object.values(weights).reduce((acc, val) => acc + val, 0) || 1;
  const reasons: RadarMatchReason[] = Object.keys(weights).map((key) => {
    const weight = weights[key as keyof typeof weights];
    const weightNormalized = weight / sum;
    const signal = signals[key as keyof typeof signals];
    const points = Math.round(weightNormalized * signal * 100);
    return { key: key as keyof typeof weights, weight, signal, points };
  });

  const raw =
    reasons.reduce((acc, item) => acc + item.signal * item.weight, 0) / sum;
  const score = Math.round(raw * 100);
  return { score, reasons };
};
