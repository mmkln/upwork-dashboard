import React from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  className = "",
}) => (
  <div
    className={`flex flex-col items-start gap-2 rounded-[10px] border border-dashed border-[#EAEBEB] bg-[#FCFDFF] p-4 ${className}`}
  >
    <p className="text-sm font-medium text-[#141414]">{title}</p>
    {description && (
      <p className="text-xs text-[#8A8A8A]">{description}</p>
    )}
    {action && <div className="pt-1">{action}</div>}
  </div>
);

export default EmptyState;
