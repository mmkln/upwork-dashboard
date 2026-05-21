import React from "react";
import { cn } from "../lib/cn";

type PageHeaderProps = React.HTMLAttributes<HTMLElement> & {
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
};

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  eyebrow,
  actions,
  className,
  ...props
}) => (
  <header
    className={cn(
      "flex flex-col gap-component lg:flex-row lg:items-start lg:justify-between",
      className,
    )}
    {...props}
  >
    <div className="max-w-readable space-y-item">
      {eyebrow ? <div className="text-label text-text-muted">{eyebrow}</div> : null}
      <h1 className="text-display text-text-primary">{title}</h1>
    </div>
    {actions ? (
      <div className="flex shrink-0 flex-wrap items-center gap-control">
        {actions}
      </div>
    ) : null}
  </header>
);

export default PageHeader;
