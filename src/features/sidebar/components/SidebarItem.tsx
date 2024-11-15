// src/components/Sidebar/SidebarItem.tsx
import React from "react";
import { Link } from "react-router-dom";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  link?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  isActive = false,
  link = "#",
}) => {
  return (
    <Link
      to={link}
      className={`flex items-center w-full px-4 py-2 mt-2 rounded hover:bg-gray-700 hover:text-gray-300 transition-colors duration-300 ${
        isActive ? "bg-gray-700 text-gray-200" : "text-gray-400"
      }`}
    >
      <div className="flex items-center justify-center w-8 h-8">{icon}</div>
      <span className="ml-3 text-sm font-medium hidden lg:block">{label}</span>
    </Link>
  );
};

export default SidebarItem;
