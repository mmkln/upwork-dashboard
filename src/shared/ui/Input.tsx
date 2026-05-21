import React from "react";
import { Input as ShadcnInput } from "components/shadcn/ui/input";
import { cn } from "lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <ShadcnInput
      ref={ref}
      className={cn(
        "h-target rounded-control border-control-border bg-control px-component text-ui text-text-primary placeholder:text-ui placeholder:text-text-placeholder hover:bg-control-hover focus:border-action focus-visible:ring-2 focus-visible:ring-ring disabled:bg-control-selected",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";

export default Input;
