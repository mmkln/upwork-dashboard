import React, { ReactNode } from 'react';

interface BaseChartProps {
  title?: string;
  width?: number;
  height?: number;
  children: ReactNode;
}

const BaseChart: React.FC<BaseChartProps> = ({ title, width = 400, height = 300, children }) => (
  <div className="bg-white shadow rounded p-4">
    {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
    <div style={{ width, height }}>
      {children}
    </div>
  </div>
);

export default BaseChart;
