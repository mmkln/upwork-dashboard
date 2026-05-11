// SidebarSection.tsx
import React from "react";

const SidebarSection: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <div className="flex w-full flex-col gap-3">{children}</div>;

export default SidebarSection;
