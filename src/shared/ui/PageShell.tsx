import React from "react";
import { cn } from "lib/utils";

type PageShellProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

const PageShell: React.FC<PageShellProps> = ({
  children,
  className,
  ...props
}) => (
  <div
    className={cn("mx-auto flex w-full max-w-content flex-col gap-card", className)}
    {...props}
  >
    {children}
  </div>
);

export default PageShell;
