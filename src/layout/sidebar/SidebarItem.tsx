// SidebarItem.tsx
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "lib/utils";

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
      aria-current={isActive ? "page" : undefined}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-target min-w-target w-full items-center justify-start gap-0 overflow-hidden rounded-full bg-transparent px-item text-text-secondary transition-colors duration-motion-fast ease-motion-standard hover:bg-control-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group-hover/sidebar:gap-control",
        isActive && "text-text-primary",
      )}
    >
      <div className="flex h-control-small w-control-small shrink-0 items-center justify-center">
        {icon}
      </div>
      <span className="max-w-0 truncate text-label opacity-0 transition-[max-width,opacity] delay-0 duration-motion-fast ease-motion-standard group-hover/sidebar:max-w-chip group-hover/sidebar:delay-motion-label group-hover/sidebar:opacity-100">
        {label}
      </span>
    </Link>
  );
};

export default SidebarItem;
