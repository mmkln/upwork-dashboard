import React from "react";
import { ProgressBar } from "../charts";
import { JobExperience, UpworkJob } from "../../models";
import { chartColors } from "../../shared/theme";
import { Card } from "../../shared/ui";

interface JobsByExperienceLevelProps {
  jobs: UpworkJob[];
}

const JobsByExperienceLevel: React.FC<JobsByExperienceLevelProps> = ({
  jobs,
}) => {
  const entry = jobs.filter(
    (job) => job.experience === JobExperience.Entry,
  ).length;
  const intermediate = jobs.filter(
    (job) => job.experience === JobExperience.Intermediate,
  ).length;
  const expert = jobs.filter(
    (job) => job.experience === JobExperience.Expert,
  ).length;
  const total = entry + intermediate + expert;

  const segments = [
    { color: chartColors.primary, value: entry, label: "Entry" },
    { color: chartColors.green, value: intermediate, label: "Intermediate" },
    { color: chartColors.amber, value: expert, label: "Expert" },
  ];

  return (
    <Card className="p-card">
      <div className="w-full max-w-sm">
        <h2 className="mb-card text-heading text-text-primary">
          Jobs by Experience Level
        </h2>
        <div className="mb-component flex items-center justify-center">
          <ProgressBar segments={segments} total={total} />
        </div>
      </div>
    </Card>
  );
};

export default JobsByExperienceLevel;
