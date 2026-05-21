import React from "react";
import { cn } from "../lib/cn";

type DetailRowProps = React.HTMLAttributes<HTMLDivElement> & {
  label: React.ReactNode;
  value?: React.ReactNode;
  emptyValue?: React.ReactNode;
};

const DetailRow: React.FC<DetailRowProps> = ({
  label,
  value,
  emptyValue = "Not provided",
  className,
  ...props
}) => (
  <div
    className={cn("flex items-start justify-between gap-control py-item", className)}
    {...props}
  >
    <p className="text-label text-text-muted">{label}</p>
    <div className="max-w-detail-value text-right text-ui text-text-primary">
      {value || <span className="text-ui text-text-muted">{emptyValue}</span>}
    </div>
  </div>
);

export default DetailRow;
