import React from "react";
import { Input as ShadcnInput } from "components/shadcn/ui/input";
import { cn } from "lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <ShadcnInput
      ref={ref}
      className={cn(
        "h-10 rounded-[10px] border-input px-4 text-sm text-text-primary placeholder:text-sm placeholder:font-normal placeholder:text-text-placeholder focus:border-action focus-visible:ring-2 focus-visible:ring-ring disabled:bg-surface-muted",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";

export default Input;
