import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import BaseChart from './BaseChart';
import { UpworkJob } from '../../../models';

interface TopSkillsChartProps {
  jobs: UpworkJob[];
  title?: string;
  limit?: number;
}

const TopSkillsChart: React.FC<TopSkillsChartProps> = ({
  jobs,
  title = 'Top Skills',
  limit = 5,
}) => {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(job => {
      job.skills.forEach(skill => {
        counts[skill] = (counts[skill] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([skill, count]) => ({ skill, count }));
  }, [jobs, limit]);

  return (
    <BaseChart title={title} width={600} height={400}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis type="category" dataKey="skill" />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" name="Jobs" />
        </BarChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default TopSkillsChart;
