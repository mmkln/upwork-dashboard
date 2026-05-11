import React from "react";
import { Badge as ShadcnBadge } from "components/shadcn/ui/badge";
import { cn } from "lib/utils";

interface BadgeProps {
  label: string;
  value: number;
  maxRate: number;
}

const Badge: React.FC<BadgeProps> = ({ label, value, maxRate }) => {
  const rateDiff = value / maxRate;
  const backgroundColor = `rgba(59, 130, 246, ${rateDiff})`;
  const color =
    rateDiff > 0.7 ? "rgba(255,255,255, 0.95)" : "rgba(45,59,101,0.8)";
  const displayLabel =
    label.length > 12 ? label.slice(0, 8).trim() + ".." : label;

  return (
    <ShadcnBadge
      variant="secondary"
      className={cn(
        "group/skill relative rounded-lg border-transparent px-2 py-1 text-xs font-medium shadow-none",
      )}
      style={{ backgroundColor, color }}
    >
      {displayLabel}
      <div className="hidden group-hover/skill:flex absolute bottom-7 rounded-xl border border-border bg-popover px-2 py-1 text-popover-foreground">
        {label} <br /> ({value})
      </div>
    </ShadcnBadge>
  );
};

export default Badge;
