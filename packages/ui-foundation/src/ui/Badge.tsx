import React from "react";
import { Badge as ShadcnBadge } from "../components/shadcn/ui/badge";
import { cn } from "../lib/cn";

type BadgeTone = "neutral" | "info" | "success" | "warning";

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  tone?: BadgeTone;
};

const toneClassName: Record<BadgeTone, string> = {
  neutral: "bg-block-subtle text-text-secondary",
  info: "bg-action-muted text-action",
  success: "bg-success-muted text-success-foreground",
  warning: "bg-warning-muted text-warning",
};

const Badge: React.FC<BadgeProps> = ({
  children,
  tone = "neutral",
  className,
  ...props
}) => (
  <ShadcnBadge
    variant="secondary"
    className={cn(
      "min-h-control-mini justify-center rounded-full border-transparent px-control py-0 text-label leading-none shadow-none hover:bg-current/0",
      toneClassName[tone],
      className,
    )}
    {...props}
  >
    {children}
  </ShadcnBadge>
);

export default Badge;
