import React from "react";
import { cn } from "../lib/cn";

type PageShellProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  width?: "content" | "wide" | "full";
};

const pageWidthClassName = {
  content: "mx-auto max-w-content",
  wide: "mx-auto max-w-wide",
  full: "max-w-none",
} as const;

const PageShell: React.FC<PageShellProps> = ({
  children,
  className,
  width = "content",
  ...props
}) => (
  <div
    className={cn(
      "flex w-full flex-col gap-card",
      pageWidthClassName[width],
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export default PageShell;
