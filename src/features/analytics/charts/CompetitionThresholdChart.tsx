import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import BaseChart from './BaseChart';
import { UpworkJob } from '../../../models';

interface CompetitionThresholdChartProps {
  jobs: UpworkJob[];
  title?: string;
}

const CompetitionThresholdChart: React.FC<CompetitionThresholdChartProps> = ({
  jobs,
  title = 'Competition Threshold',
}) => {
  const avgConnects = useMemo(() => {
    const total = jobs.reduce((sum, job) => sum + (Number(job.connects) || 0), 0);
    return jobs.length > 0 ? total / jobs.length : 0;
  }, [jobs]);

  const data = [{ metric: 'Avg Connects', value: parseFloat(avgConnects.toFixed(2)) }];

  return (
    <BaseChart title={title} width={600} height={400}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" name="Average Connects" />
        </BarChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default CompetitionThresholdChart;
