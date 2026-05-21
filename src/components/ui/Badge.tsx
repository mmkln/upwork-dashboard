import React from "react";
import { Badge as SharedBadge } from "../../shared/ui";
import { cn } from "lib/utils";

interface BadgeProps {
  label: string;
  value: number;
  maxRate: number;
}

const Badge: React.FC<BadgeProps> = ({ label, value, maxRate }) => {
  const rateDiff = value / maxRate;
  const backgroundColor = `hsl(var(--action) / ${rateDiff})`;
  const color =
    rateDiff > 0.7 ? "hsl(var(--action-foreground))" : "hsl(var(--action))";
  const displayLabel =
    label.length > 12 ? label.slice(0, 8).trim() + ".." : label;

  return (
    <SharedBadge
      tone="info"
      className={cn(
        "group/skill relative rounded-full border-transparent px-control py-0 text-label leading-none shadow-none",
      )}
      style={{ backgroundColor, color }}
    >
      {displayLabel}
      <div className="absolute bottom-7 hidden rounded-control border border-island-border bg-material-liquid px-item py-micro text-text-primary shadow-premium backdrop-blur-2xl group-hover/skill:flex">
        {label} <br /> ({value})
      </div>
    </SharedBadge>
  );
};

export default Badge;
