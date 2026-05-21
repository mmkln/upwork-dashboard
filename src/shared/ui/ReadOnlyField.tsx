import React from "react";
import { cn } from "lib/utils";

type ReadOnlyFieldProps = React.HTMLAttributes<HTMLDivElement> & {
  label: React.ReactNode;
  value?: React.ReactNode;
  emptyValue?: React.ReactNode;
};

const ReadOnlyField: React.FC<ReadOnlyFieldProps> = ({
  label,
  value,
  emptyValue = "-",
  className,
  ...props
}) => (
  <div
    className={cn("grid grid-cols-[92px_minmax(0,1fr)] gap-item", className)}
    {...props}
  >
    <span className="text-label text-text-muted">{label}</span>
    <span className="truncate text-ui text-text-primary">{value || emptyValue}</span>
  </div>
);

export default ReadOnlyField;
