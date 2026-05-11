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
      className={`flex h-12 min-w-12 w-full items-center gap-2 overflow-hidden rounded-xl px-3 py-3 text-text-secondary transition-colors duration-300 hover:bg-accent hover:text-accent-foreground ${
        isActive ? "bg-accent text-accent-foreground" : ""
      }`}
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center">
        {icon}
      </div>
      <span className="hidden truncate text-xs font-medium group-hover:block">
        {label}
      </span>
    </Link>
  );
};

export default SidebarItem;
