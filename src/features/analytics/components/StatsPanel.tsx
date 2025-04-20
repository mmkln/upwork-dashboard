import React from 'react';
import { JobStats, JobCalendar } from '../../../components';
import { UpworkJob } from '../../../models';

interface StatsPanelProps {
  jobs: UpworkJob[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ jobs }) => {
  const today = new Date();
  return (
    <div className="flex gap-4">
      <div className="max-w-3xl">
        <JobStats jobs={jobs} />
      </div>
      <div>
        <JobCalendar jobs={jobs} month={today} />
      </div>
    </div>
  );
};

export default StatsPanel;
