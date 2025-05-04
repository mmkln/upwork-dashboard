import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import BaseChart from './BaseChart';
import { UpworkJob, JobExperience } from '../../../models';

interface AverageRateByExperienceLevelChartProps {
  jobs: UpworkJob[];
  title?: string;
}

const AverageRateByExperienceLevelChart: React.FC<AverageRateByExperienceLevelChartProps> = ({
  jobs,
  title = 'Average Rate by Experience Level',
}) => {
  const data = useMemo(() => {
    const levels = Object.values(JobExperience);
    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};
    levels.forEach(level => {
      sums[level] = 0;
      counts[level] = 0;
    });
    jobs.forEach(job => {
      const exp = job.experience;
      const rate = job.average_rate ?? 0;
      sums[exp] = (sums[exp] || 0) + rate;
      counts[exp] = (counts[exp] || 0) + 1;
    });
    return levels.map(level => ({
      experience: level,
      averageRate: counts[level] > 0 ? sums[level] / counts[level] : 0,
    }));
  }, [jobs]);

  return (
    <BaseChart title={title} width={600} height={400}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="experience" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="averageRate" fill="#8884d8" name="Average Rate" />
        </BarChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default AverageRateByExperienceLevelChart;
