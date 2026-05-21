import React from "react";
import { cn } from "lib/utils";

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
    className={cn(
      "flex flex-col items-start gap-item rounded-block bg-block-subtle p-component",
      className,
    )}
  >
    <p className="text-ui text-text-primary">{title}</p>
    {description && (
      <p className="text-body text-text-muted">{description}</p>
    )}
    {action && <div className="pt-micro">{action}</div>}
  </div>
);

export default EmptyState;
