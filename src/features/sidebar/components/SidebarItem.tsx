// SidebarItem.tsx
import React from "react";
import { Link } from "react-router-dom";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  link: string;
  currentPath: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  link,
  currentPath,
}) => {
  const isActive = currentPath === link;

  return (
    <Link
      to={link}
      className={`flex items-center gap-1.5 h-9 w-full p-1.5 rounded-lg transition-colors duration-300 overflow-hidden hover:bg-[#F6F8FF] text-[#575757] ${
        isActive ? "bg-[#F6F8FF]" : ""
      }`}
    >
      <div className="flex w-6 h-6 items-center justify-center">{icon}</div>
      <span className="text-xs font-medium hidden group-hover:block">
        {label}
      </span>
    </Link>
  );
};

export default SidebarItem;
