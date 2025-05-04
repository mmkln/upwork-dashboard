import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import BaseChart from './BaseChart';
import { UpworkJob } from '../../../models';

interface BudgetHistogramChartProps {
  jobs: UpworkJob[];
  title?: string;
  buckets?: { range: string; min: number; max?: number }[];
}

const DEFAULT_BUCKETS = [
  { range: '0-100$', min: 0, max: 100 },
  { range: '100-500$', min: 100, max: 500 },
  { range: '500-1000$', min: 500, max: 1000 },
  { range: '1000+$', min: 1000 },
];

const BudgetHistogramChart: React.FC<BudgetHistogramChartProps> = ({
  jobs,
  title = 'Budget Histogram',
  buckets = DEFAULT_BUCKETS,
}) => {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    buckets.forEach((b) => { counts[b.range] = 0; });
    jobs.forEach((job) => {
      const price = job.fixed_price ?? job.average_rate ?? 0;
      const bucket = buckets.find((b) => price >= b.min && (b.max === undefined || price < b.max));
      const key = bucket ? bucket.range : 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([bucket, count]) => ({ bucket, count }));
  }, [jobs, buckets]);

  return (
    <BaseChart title={title} width={600} height={400}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bucket" label={{ value: 'Price Range', position: 'insideBottom', offset: -5 }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#82ca9d" name="Jobs" />
        </BarChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default BudgetHistogramChart;
