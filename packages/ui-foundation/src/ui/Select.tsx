import React from "react";
import { cn } from "../lib/cn";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-target rounded-control border border-control-border bg-control px-component text-ui text-text-primary hover:bg-control-hover focus:border-action focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:bg-control-selected disabled:text-text-muted",
        className,
      )}
      {...props}
    />
  ),
);

Select.displayName = "Select";

export default Select;
