import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import BaseChart from './BaseChart';
import { UpworkJob } from '../../../models';

const COLORS = ['#8884d8','#82ca9d','#ffc658','#ff8042','#8dd1e1','#a4de6c','#d0ed57','#ffc0cb','#d88484','#84d8d8'];

interface CategoriesDistributionChartProps {
  jobs: UpworkJob[];
  title?: string;
  maxCategories?: number;
}

const CategoriesDistributionChart: React.FC<CategoriesDistributionChartProps> = ({
  jobs,
  title = 'Jobs by Category',
  maxCategories = 10,
}) => {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(job => {
      const category = job.client_industry || 'Unknown';
      counts[category] = (counts[category] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxCategories)
      .map(([category, count]) => ({ name: category, value: count }));
  }, [jobs, maxCategories]);

  return (
    <BaseChart title={title} width={600} height={400}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default CategoriesDistributionChart;
