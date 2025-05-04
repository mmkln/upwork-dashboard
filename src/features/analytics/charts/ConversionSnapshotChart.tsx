import React, { useMemo } from 'react';
import BaseChart from './BaseChart';
import { UpworkJob } from '../../../models';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

interface ConversionSnapshotChartProps {
  jobs: UpworkJob[];
  title?: string;
}

const COLORS = ['#82ca9d', '#8884d8'];

const ConversionSnapshotChart: React.FC<ConversionSnapshotChartProps> = ({
  jobs,
  title = 'Conversion Snapshot',
}) => {
  const data = useMemo(() => {
    const closedCount = jobs.filter(job => job.status === 'closed').length;
    const openCount = jobs.length - closedCount;
    return [
      { name: 'Closed', value: closedCount },
      { name: 'Open', value: openCount },
    ];
  }, [jobs]);

  return (
    <BaseChart title={title} width={400} height={300}>
      <PieChart width={400} height={300}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </BaseChart>
  );
};

export default ConversionSnapshotChart;
