import React from "react";
import WordCloud from "react-wordcloud";
import { UpworkJob } from "../models";

interface SkillsWordCloudProps {
  jobs: UpworkJob[];
}

const SkillsWordCloud: React.FC<SkillsWordCloudProps> = ({ jobs }) => {
  const skillsData = jobs.reduce((acc: { [key: string]: number }, job) => {
    if (job.skills) {
      job.skills.forEach((skill: string) => {
        if (!acc[skill]) {
          acc[skill] = 1;
        } else {
          acc[skill] += 1;
        }
      });
    }
    return acc;
  }, {});

  const words = Object.keys(skillsData).map((skill) => ({
    text: skill,
    value: skillsData[skill],
  }));

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-4">Skills Word Cloud</h2>
      <WordCloud words={words} />
    </div>
  );
};

export default SkillsWordCloud;
