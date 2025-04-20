import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from 'recharts';
import BaseChart from './BaseChart';
import { UpworkJob } from '../../../models';

interface JobsByCountryChartProps {
  jobs: UpworkJob[];
  title?: string;
  maxCountries?: number;
}

const JobsByCountryChart: React.FC<JobsByCountryChartProps> = ({
  jobs,
  title = 'Jobs by Country',
  maxCountries = 10,
}) => {
  const data = useMemo(() => {
    const counts = jobs.reduce<Record<string, number>>((acc, job) => {
      const country = job.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxCountries)
      .map(([country, count]) => ({ country, count }));
  }, [jobs, maxCountries]);

  return (
    <BaseChart title={title} width={600} height={400}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="country" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" name="Jobs" />
        </BarChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default JobsByCountryChart;
