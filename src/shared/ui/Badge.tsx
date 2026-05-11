import React from "react";
import { Badge as ShadcnBadge } from "components/shadcn/ui/badge";
import { cn } from "lib/utils";

type BadgeTone = "neutral" | "info" | "success" | "warning";

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  tone?: BadgeTone;
};

const toneClassName: Record<BadgeTone, string> = {
  neutral: "bg-muted text-text-secondary",
  info: "bg-accent text-accent-foreground",
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
      "rounded-full border-transparent px-2 py-0.5 text-[11px] font-medium shadow-none hover:bg-current/0",
      toneClassName[tone],
      className,
    )}
    {...props}
  >
    {children}
  </ShadcnBadge>
);

export default Badge;
