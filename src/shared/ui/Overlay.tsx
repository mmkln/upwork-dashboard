import React from "react";
import { cn } from "lib/utils";

export const OverlayHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "border-b border-island-border bg-material-chrome px-panel py-card backdrop-blur-2xl",
      className,
    )}
    {...props}
  />
));
OverlayHeader.displayName = "OverlayHeader";

export const OverlayBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-panel py-card", className)} {...props} />
));
OverlayBody.displayName = "OverlayBody";

export const OverlayFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "border-t border-island-border bg-material-chrome px-panel py-card backdrop-blur-2xl",
      className,
    )}
    {...props}
  />
));
OverlayFooter.displayName = "OverlayFooter";
