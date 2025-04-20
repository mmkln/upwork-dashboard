import React from 'react';
import { usePublicStats } from '../features/public/hooks/usePublicStats';

const PublicAnalyticsPage: React.FC = () => {
  const { data, isLoading, error } = usePublicStats();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Public Statistics</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default PublicAnalyticsPage;
