import React from "react";

type BadgeTone = "neutral" | "info" | "success" | "warning";

export type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
};

const toneClassName: Record<BadgeTone, string> = {
  neutral: "bg-[#F5F5F5] text-[#575757]",
  info: "bg-[#F6F8FF] text-[#575757]",
  success: "bg-[#E7F8EE] text-[#1F7A4C]",
  warning: "bg-[#FFF4E5] text-[#9A5B13]",
};

const Badge: React.FC<BadgeProps> = ({
  children,
  tone = "neutral",
  className = "",
}) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${toneClassName[tone]} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
