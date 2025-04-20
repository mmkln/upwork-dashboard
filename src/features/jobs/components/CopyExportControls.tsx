import React from 'react';
import { Job } from '../../../models/job';

interface Props {
  count: number;
  onCopy: () => void;
  onDownload: () => void;
}

const CopyExportControls: React.FC<Props> = ({ count, onCopy, onDownload }) => (
  <div className="flex space-x-2">
    <button
      className="p-2 rounded text-gray-500 hover:bg-gray-100 disabled:text-gray-200 disabled:bg-white"
      title="Copy jobs to clipboard"
      onClick={onCopy}
      disabled={count === 0}
    >
      Copy
    </button>
    <button
      className="p-2 rounded text-gray-500 hover:bg-gray-100 disabled:text-gray-200 disabled:bg-white"
      title="Export jobs as JSON file"
      onClick={onDownload}
      disabled={count === 0}
    >
      Download
    </button>
  </div>
);

export default CopyExportControls;
