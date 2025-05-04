import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import BaseChart from './BaseChart';
import { UpworkJob } from '../../../models';

interface TrendingKeywordsChartProps {
  jobs: UpworkJob[];
  title?: string;
  limit?: number;
}

const TrendingKeywordsChart: React.FC<TrendingKeywordsChartProps> = ({
  jobs,
  title = 'Trending Keywords Over Time',
  limit = 5,
}) => {
  const data = useMemo(() => {
    // aggregate keywords overall
    const overallCounts: Record<string, number> = {};
    // map date -> counts per keyword
    const dateMap: Record<string, Record<string, number>> = {};

    jobs.forEach(job => {
      // derive date key
      const dateKey = new Date(job.created_at).toISOString().slice(0, 10);
      if (!dateMap[dateKey]) dateMap[dateKey] = {};
      // split description into words
      const text = (job.description || '').toLowerCase();
      const words = text.match(/\b\w{3,}\b/g) || [];
      words.forEach(word => {
        overallCounts[word] = (overallCounts[word] || 0) + 1;
        dateMap[dateKey][word] = (dateMap[dateKey][word] || 0) + 1;
      });
    });
    // select top keywords
    const topKeywords = Object.entries(overallCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([word]) => word);
    // build array sorted by date
    const dates = Object.keys(dateMap).sort();
    return dates.map(date => {
      const entry: any = { date };
      topKeywords.forEach(kw => {
        entry[kw] = dateMap[date][kw] || 0;
      });
      return entry;
    });
  }, [jobs, limit]);

  const keywords = useMemo(() => {
    // extract keyword keys from data
    const first = data[0] || {};
    return Object.keys(first).filter(k => k !== 'date');
  }, [data]);

  return (
    <BaseChart title={title} width={600} height={400}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {keywords.map((kw, idx) => (
            <Line key={kw} type="monotone" dataKey={kw} stroke={['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'][idx % 5]} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </BaseChart>
  );
};

export default TrendingKeywordsChart;
