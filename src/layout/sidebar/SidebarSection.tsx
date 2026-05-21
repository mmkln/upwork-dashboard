// SidebarSection.tsx
import React from "react";

const SidebarSection: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="flex w-full flex-col gap-control">{children}</div>;

export default SidebarSection;
