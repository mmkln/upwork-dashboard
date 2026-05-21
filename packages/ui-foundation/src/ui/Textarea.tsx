import React from "react";
import { cn } from "../lib/cn";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 rounded-control border border-control-border bg-control px-component py-control text-ui text-text-primary placeholder:text-ui placeholder:text-text-placeholder hover:bg-control-hover focus:border-action focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:bg-control-selected disabled:text-text-muted",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";

export default Textarea;
