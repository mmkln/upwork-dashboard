import React from "react";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
};

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = "",
}) => (
  <div className={`w-full h-full p-5 bg-[#FCFDFF] ${className}`}>
    {children}
  </div>
);

export default PageContainer;
