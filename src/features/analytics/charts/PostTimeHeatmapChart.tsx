import React, { useMemo } from 'react';
import BaseChart from './BaseChart';
import { UpworkJob } from '../../../models';
import HeatMapGrid from 'react-heatmap-grid';

interface PostTimeHeatmapChartProps {
  jobs: UpworkJob[];
  title?: string;
}

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const hours = Array.from({ length: 24 }, (_, i) => i.toString());

const PostTimeHeatmapChart: React.FC<PostTimeHeatmapChartProps> = ({
  jobs,
  title = 'Post Time Heatmap',
}) => {
  const data = useMemo(() => {
    const matrix: number[][] = days.map(() => Array(24).fill(0));
    jobs.forEach((job) => {
      const date = new Date(job.created_at);
      const day = date.getDay();
      const hour = date.getHours();
      matrix[day][hour] += 1;
    });
    return matrix;
  }, [jobs]);

  const max = Math.max(...data.flat());
  const min = 0;

  return (
    <BaseChart title={title} width={600} height={400}>
      <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
        <HeatMapGrid
          data={data}
          xLabels={hours}
          yLabels={days}
          xLabelsLocation="bottom"
          cellHeight="20px"
          square
          cellStyle={(background: string, value: number) => ({
            background: `rgba(33, 150, 243, ${value / (max || 1)})`,
            fontSize: '11px',
            color: '#000',
          })}
          cellRender={(value: number) => <div>{value}</div>}
        />
      </div>
    </BaseChart>
  );
};

export default PostTimeHeatmapChart;
