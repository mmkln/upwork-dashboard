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
      className={`flex items-center p-2 rounded hover:bg-[#023ca5] hover:text-gray-300 transition-colors duration-300 overflow-hidden ${
        isActive ? "bg-[#002e82] text-gray-200" : "text-gray-400"
      }`}
    >
      <div className="flex items-center justify-center">
        <div className="flex w-8 h-8 items-center justify-center">{icon}</div>
        <span className="ml-3 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {label}
        </span>
      </div>
    </Link>
  );
};

export default SidebarItem;
