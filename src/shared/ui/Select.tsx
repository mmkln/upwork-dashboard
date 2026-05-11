import React from "react";
import { cn } from "lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-10 rounded-[10px] border border-input bg-surface px-4 text-sm text-text-primary focus:border-action focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted",
        className,
      )}
      {...props}
    />
  ),
);

Select.displayName = "Select";

export default Select;
