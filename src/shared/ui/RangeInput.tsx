import React from "react";
import { cn } from "lib/utils";

export type RangeInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const RangeInput = React.forwardRef<HTMLInputElement, RangeInputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type="range"
      className={cn(
        "h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted accent-primary disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);

RangeInput.displayName = "RangeInput";

export default RangeInput;
