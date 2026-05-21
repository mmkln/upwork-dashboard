import React from "react";
import { cn } from "../lib/cn";

export type RangeInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const RangeInput = React.forwardRef<HTMLInputElement, RangeInputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type="range"
      className={cn(
        "min-h-control-small w-full cursor-pointer appearance-none rounded-full bg-control accent-action hover:bg-control-hover disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);

RangeInput.displayName = "RangeInput";

export default RangeInput;
