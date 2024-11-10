import React from "react";

interface SidebarSectionProps {
  children: React.ReactNode;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ children }) => (
  <div className="flex flex-col w-full mt-4 border-t border-gray-700 pt-4">
    {children}
  </div>
);

export default SidebarSection;
