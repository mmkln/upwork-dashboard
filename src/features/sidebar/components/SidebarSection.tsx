// SidebarSection.tsx
import React from "react";

const SidebarSection: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="flex flex-col w-full gap-2">{children}</div>;

export default SidebarSection;
