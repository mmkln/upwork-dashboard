import React from "react";
import { ProgressBar } from "../charts";
import { JobExperience, UpworkJob } from "../../models";
import { Card } from "../ui"; // Інтерфейс UpworkJob

interface JobsByExperienceLevelProps {
  jobs: UpworkJob[];
}

const JobsByExperienceLevel: React.FC<JobsByExperienceLevelProps> = ({
  jobs,
}) => {
  // Фільтруємо кількість робіт для кожного рівня досвіду
  const entry = jobs.filter(
    (job) => job.experience === JobExperience.Entry,
  ).length;
  const intermediate = jobs.filter(
    (job) => job.experience === JobExperience.Intermediate,
  ).length;
  const expert = jobs.filter(
    (job) => job.experience === JobExperience.Expert,
  ).length;

  // Загальна кількість для відсотків
  const total = entry + intermediate + expert;

  const segments = [
    { color: "#3f88ff", value: entry, label: "Entry" }, // Фіолетовий для Entry
    { color: "#5ac59f", value: intermediate, label: "Intermediate" }, // Синій для Intermediate
    { color: "#f4bb29", value: expert, label: "Expert" }, // Помаранчевий для Expert
  ];

  return (
    <Card>
      <div className="p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-8">Jobs by Experience Level</h2>

        <div className="flex items-center justify-center mb-4">
          <ProgressBar segments={segments} total={total} />
        </div>
      </div>
    </Card>
  );
};

export default JobsByExperienceLevel;
