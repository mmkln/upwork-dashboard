import React from "react";
import { cn } from "lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 rounded-[10px] border border-input bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-sm placeholder:font-normal placeholder:text-text-placeholder focus:border-action focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted",
        className,
      )}
      {...props}
    />
  ),
);

Textarea.displayName = "Textarea";

export default Textarea;
