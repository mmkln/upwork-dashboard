import React from "react";

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
    <div
      className="relative px-2 py-1 rounded-lg text-xs font-medium group/skill"
      style={{ backgroundColor, color }}
    >
      {displayLabel}
      <div className="hidden group-hover/skill:flex absolute bottom-7 bg-white border border-gray-200 rounded-xl px-2 py-1 text-gray-800">
        {label} <br /> ({value})
      </div>
    </div>
  );
};

export default Badge;
