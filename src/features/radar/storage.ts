import type { Application, Radar, RadarMatch } from "./types";
import { seedApplications, seedRadars } from "./seed";

const STORAGE_KEYS = {
  radars: "radars",
  applications: "applications",
  matches: "radarMatches",
};

const safeParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    return fallback;
  }
};

export const loadRadars = (): Radar[] => {
  return safeParse<Radar[]>(
    typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEYS.radars)
      : null,
    seedRadars,
  );
};

export const saveRadars = (radars: Radar[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.radars, JSON.stringify(radars));
};

export const loadApplications = (): Application[] => {
  return safeParse<Application[]>(
    typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEYS.applications)
      : null,
    seedApplications,
  );
};

export const saveApplications = (applications: Application[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEYS.applications,
    JSON.stringify(applications),
  );
};

export const loadMatches = (): Record<string, RadarMatch[]> => {
  return safeParse<Record<string, RadarMatch[]>>(
    typeof window !== "undefined"
      ? window.localStorage.getItem(STORAGE_KEYS.matches)
      : null,
    {},
  );
};

export const saveMatches = (matches: Record<string, RadarMatch[]>) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEYS.matches,
    JSON.stringify(matches),
  );
};
