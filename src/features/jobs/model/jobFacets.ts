import type { PreparedUpworkJob } from "../../../models";

const sortText = (values: string[]) =>
  values.sort((left, right) => left.localeCompare(right));

const sortNumber = (values: number[]) => values.sort((left, right) => left - right);

export type JobFacets = {
  skills: string[];
  instruments: string[];
  statuses: string[];
  countries: string[];
  experiences: string[];
  collectionIds: number[];
};

export const buildJobFacets = (jobs: PreparedUpworkJob[]): JobFacets => {
  const skills = new Set<string>();
  const instruments = new Set<string>();
  const statuses = new Set<string>();
  const countries = new Set<string>();
  const experiences = new Set<string>();
  const collectionIds = new Set<number>();

  jobs.forEach((job) => {
    job.skills.forEach((skill) => {
      if (skill) skills.add(skill);
    });
    job.matchedInstruments.forEach((instrument) => {
      if (instrument) instruments.add(instrument);
    });
    if (job.status) statuses.add(job.status);
    if (job.country) countries.add(job.country);
    if (job.experience) experiences.add(job.experience);
    (job.collections ?? []).forEach((collectionId) => {
      collectionIds.add(collectionId);
    });
  });

  return {
    skills: sortText(Array.from(skills)),
    instruments: sortText(Array.from(instruments)),
    statuses: sortText(Array.from(statuses)),
    countries: sortText(Array.from(countries)),
    experiences: sortText(Array.from(experiences)),
    collectionIds: sortNumber(Array.from(collectionIds)),
  };
};
